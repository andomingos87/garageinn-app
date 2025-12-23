'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserWithRoles, UserRoleInfo, UserStatus, UserUnitInfo, AuditLog } from '@/lib/supabase/database.types'

export interface UsersFilters {
  search?: string
  status?: UserStatus | 'all'
  departmentId?: string
  page?: number
  limit?: number
}

export interface PaginatedUsers {
  users: UserWithRoles[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersStats {
  total: number
  active: number
  pending: number
  inactive: number
}

export interface UnitOption {
  id: string
  name: string
  code: string
}

export interface UserUnitInput {
  unitId: string
  isCoverage: boolean
}

/**
 * Busca lista de usuários com seus cargos e departamentos (com paginação)
 */
export async function getUsers(filters?: UsersFilters): Promise<PaginatedUsers> {
  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit

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
      ),
      user_units (
        id,
        is_coverage,
        unit:units (
          id,
          name,
          code
        )
      )
    `, { count: 'exact' })
    .order('full_name')
    .range(offset, offset + limit - 1)

  // Filtro de busca
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  // Filtro de status
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('Erro ao buscar usuários')
  }

  // Transformar dados para o formato esperado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: UserWithRoles[] = (data || []).map((profile: any) => {
    const roles: UserRoleInfo[] = (profile.user_roles || [])
      .filter((ur: any) => ur.role !== null)
      .map((ur: any) => ({
        role_id: ur.role.id,
        role_name: ur.role.name,
        department_id: ur.role.department?.id ?? null,
        department_name: ur.role.department?.name ?? null,
        is_global: ur.role.is_global ?? false,
      }))

    const units: UserUnitInfo[] = (profile.user_units || [])
      .filter((uu: any) => uu.unit !== null)
      .map((uu: any) => ({
        id: uu.id,
        unit_id: uu.unit.id,
        unit_name: uu.unit.name,
        unit_code: uu.unit.code,
        is_coverage: uu.is_coverage ?? false,
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
      units,
    }
  })

  // Filtrar por departamento se necessário (client-side após paginação)
  if (filters?.departmentId) {
    users = users.filter(user => 
      user.roles.some(r => r.department_id === filters.departmentId)
    )
  }

  const total = count || 0

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
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

// ============================================
// Funções de Unidades
// ============================================

/**
 * Busca lista de unidades ativas
 */
export async function getUnits(): Promise<UnitOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Error fetching units:', error)
    return []
  }

  return data || []
}

/**
 * Busca unidades vinculadas a um usuário
 */
export async function getUserUnits(userId: string): Promise<UserUnitInfo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_units')
    .select(`
      id,
      is_coverage,
      unit:units (
        id,
        name,
        code
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user units:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((uu: any) => ({
    id: uu.id,
    unit_id: uu.unit.id,
    unit_name: uu.unit.name,
    unit_code: uu.unit.code,
    is_coverage: uu.is_coverage ?? false,
  }))
}

/**
 * Atualiza unidades vinculadas a um usuário
 */
export async function updateUserUnits(userId: string, units: UserUnitInput[]) {
  const supabase = await createClient()

  // Remover vínculos existentes
  const { error: deleteError } = await supabase
    .from('user_units')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error removing user units:', deleteError)
    return { error: deleteError.message }
  }

  // Adicionar novos vínculos
  if (units.length > 0) {
    const unitInserts = units.map(u => ({
      user_id: userId,
      unit_id: u.unitId,
      is_coverage: u.isCoverage,
    }))

    const { error: insertError } = await supabase
      .from('user_units')
      .insert(unitInserts)

    if (insertError) {
      console.error('Error adding user units:', insertError)
      return { error: insertError.message }
    }
  }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return { success: true }
}

// ============================================
// Funções de Auditoria
// ============================================

/**
 * Busca logs de auditoria de um usuário específico
 */
export async function getUserAuditLogs(userId: string): Promise<AuditLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }

  return (data || []) as AuditLog[]
}

