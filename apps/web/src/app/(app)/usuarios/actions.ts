'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserWithRoles, UserRoleInfo, UserStatus } from '@/lib/supabase/database.types'

export interface UsersFilters {
  search?: string
  status?: UserStatus | 'all'
  departmentId?: string
}

export interface UsersStats {
  total: number
  active: number
  pending: number
  inactive: number
}

/**
 * Busca lista de usuários com seus cargos e departamentos
 */
export async function getUsers(filters?: UsersFilters): Promise<UserWithRoles[]> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      phone,
      cpf,
      avatar_url,
      status,
      created_at,
      updated_at,
      user_roles (
        role:roles (
          id,
          name,
          is_global,
          department:departments (
            id,
            name
          )
        )
      )
    `)
    .order('full_name')

  // Filtro de busca
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  // Filtro de status
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('Erro ao buscar usuários')
  }

  // Transformar dados para o formato esperado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: UserWithRoles[] = (data || []).map((profile: any) => {
    const roles: UserRoleInfo[] = (profile.user_roles || [])
      .filter((ur: any) => ur.role !== null)
      .map((ur: any) => ({
        role_id: ur.role.id,
        role_name: ur.role.name,
        department_id: ur.role.department?.id ?? null,
        department_name: ur.role.department?.name ?? null,
        is_global: ur.role.is_global ?? false,
      }))

    // Filtrar por departamento se necessário
    if (filters?.departmentId) {
      const hasMatchingRole = roles.some(r => r.department_id === filters.departmentId)
      if (!hasMatchingRole) return null
    }

    return {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      cpf: profile.cpf,
      avatar_url: profile.avatar_url,
      status: (profile.status || 'pending') as UserStatus,
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      roles,
    }
  }).filter((u): u is UserWithRoles => u !== null)

  return users
}

/**
 * Busca estatísticas de usuários
 */
export async function getUsersStats(): Promise<UsersStats> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('status')

  if (error) {
    console.error('Error fetching user stats:', error)
    return { total: 0, active: 0, pending: 0, inactive: 0 }
  }

  const stats = (data || []).reduce(
    (acc, profile) => {
      acc.total++
      if (profile.status === 'active') acc.active++
      else if (profile.status === 'pending') acc.pending++
      else if (profile.status === 'inactive') acc.inactive++
      return acc
    },
    { total: 0, active: 0, pending: 0, inactive: 0 }
  )

  return stats
}

/**
 * Busca lista de departamentos
 */
export async function getDepartments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Error fetching departments:', error)
    return []
  }

  return data || []
}

/**
 * Busca lista de cargos, opcionalmente filtrados por departamento
 */
export async function getRoles(departmentId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('roles')
    .select('id, name, is_global, department_id')
    .order('name')

  if (departmentId) {
    query = query.or(`department_id.eq.${departmentId},is_global.eq.true`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching roles:', error)
    return []
  }

  return data || []
}

/**
 * Busca um usuário específico pelo ID
 */
export async function getUserById(userId: string): Promise<UserWithRoles | null> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      phone,
      cpf,
      avatar_url,
      status,
      created_at,
      updated_at,
      user_roles (
        role:roles (
          id,
          name,
          is_global,
          department:departments (
            id,
            name
          )
        )
      )
    `)
    .eq('id', userId)
    .single()

  if (error || !profile) {
    console.error('Error fetching user:', error)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles: UserRoleInfo[] = (profile.user_roles || [])
    .filter((ur: any) => ur.role !== null)
    .map((ur: any) => ({
      role_id: ur.role.id,
      role_name: ur.role.name,
      department_id: ur.role.department?.id ?? null,
      department_name: ur.role.department?.name ?? null,
      is_global: ur.role.is_global ?? false,
    }))

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    cpf: profile.cpf,
    avatar_url: profile.avatar_url,
    status: (profile.status || 'pending') as UserStatus,
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
    roles,
  }
}

/**
 * Atualiza o status de um usuário
 */
export async function updateUserStatus(userId: string, status: UserStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user status:', error)
    return { error: error.message }
  }

  revalidatePath('/usuarios')
  return { success: true }
}

/**
 * Atualiza os dados de um usuário
 */
export async function updateUser(
  userId: string,
  data: {
    full_name?: string
    phone?: string | null
    cpf?: string | null
    status?: UserStatus
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) {
    console.error('Error updating user:', error)
    return { error: error.message }
  }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return { success: true }
}

/**
 * Atualiza os cargos de um usuário
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  const supabase = await createClient()

  // Remover cargos existentes
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error removing user roles:', deleteError)
    return { error: deleteError.message }
  }

  // Adicionar novos cargos
  if (roleIds.length > 0) {
    const roleInserts = roleIds.map(roleId => ({
      user_id: userId,
      role_id: roleId,
    }))

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(roleInserts)

    if (insertError) {
      console.error('Error adding user roles:', insertError)
      return { error: insertError.message }
    }
  }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return { success: true }
}

/**
 * Verifica se o usuário atual é admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data === true
}

