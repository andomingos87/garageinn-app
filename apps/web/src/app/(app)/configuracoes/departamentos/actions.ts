'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface Department {
  id: string
  name: string
  created_at: string
  roles_count: number
  users_count: number
}

export interface Role {
  id: string
  name: string
  department_id: string | null
  department_name: string | null
  is_global: boolean
  created_at: string
  users_count: number
}

export interface DepartmentWithRoles extends Department {
  roles: Role[]
}

// ============================================
// Department Actions
// ============================================

/**
 * Busca todos os departamentos com contagem de cargos e usuários
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      created_at,
      roles (id)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching departments:', error)
    throw new Error('Erro ao buscar departamentos')
  }

  // Buscar contagem de usuários por departamento
  const { data: userCounts, error: userCountError } = await supabase
    .from('user_roles')
    .select(`
      role:roles (
        department_id
      )
    `)

  if (userCountError) {
    console.error('Error fetching user counts:', userCountError)
  }

  // Contar usuários por departamento
  const usersByDepartment: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(userCounts || []).forEach((ur: any) => {
    const deptId = ur.role?.department_id
    if (deptId) {
      usersByDepartment[deptId] = (usersByDepartment[deptId] || 0) + 1
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((dept: any) => ({
    id: dept.id,
    name: dept.name,
    created_at: dept.created_at,
    roles_count: dept.roles?.length || 0,
    users_count: usersByDepartment[dept.id] || 0,
  }))
}

/**
 * Busca um departamento específico com seus cargos
 */
export async function getDepartmentById(id: string): Promise<DepartmentWithRoles | null> {
  const supabase = await createClient()

  const { data: dept, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      created_at,
      roles (
        id,
        name,
        is_global,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !dept) {
    console.error('Error fetching department:', error)
    return null
  }

  // Buscar contagem de usuários por cargo
  const { data: userCounts, error: userCountError } = await supabase
    .from('user_roles')
    .select('role_id')

  if (userCountError) {
    console.error('Error fetching user counts:', userCountError)
  }

  // Contar usuários por cargo
  const usersByRole: Record<string, number> = {}
  ;(userCounts || []).forEach((ur: { role_id: string }) => {
    usersByRole[ur.role_id] = (usersByRole[ur.role_id] || 0) + 1
  })

  // Contar total de usuários no departamento
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles: Role[] = (dept.roles || []).map((role: any) => ({
    id: role.id,
    name: role.name,
    department_id: id,
    department_name: dept.name,
    is_global: role.is_global || false,
    created_at: role.created_at,
    users_count: usersByRole[role.id] || 0,
  }))

  const totalUsers = roles.reduce((sum, role) => sum + role.users_count, 0)

  return {
    id: dept.id,
    name: dept.name,
    created_at: dept.created_at,
    roles_count: roles.length,
    users_count: totalUsers,
    roles,
  }
}

/**
 * Cria um novo departamento
 */
export async function createDepartment(name: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('departments')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) {
    console.error('Error creating department:', error)
    if (error.code === '23505') {
      return { error: 'Já existe um departamento com este nome' }
    }
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  return { success: true, data }
}

/**
 * Atualiza um departamento existente
 */
export async function updateDepartment(id: string, name: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('departments')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) {
    console.error('Error updating department:', error)
    if (error.code === '23505') {
      return { error: 'Já existe um departamento com este nome' }
    }
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  revalidatePath(`/configuracoes/departamentos/${id}`)
  return { success: true }
}

/**
 * Exclui um departamento
 */
export async function deleteDepartment(id: string) {
  const supabase = await createClient()

  // Verificar se há cargos vinculados
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id')
    .eq('department_id', id)
    .limit(1)

  if (rolesError) {
    console.error('Error checking roles:', rolesError)
    return { error: 'Erro ao verificar cargos vinculados' }
  }

  if (roles && roles.length > 0) {
    return { error: 'Não é possível excluir um departamento com cargos vinculados. Remova os cargos primeiro.' }
  }

  // Verificar se há categorias de chamados vinculadas
  const { data: categories, error: categoriesError } = await supabase
    .from('ticket_categories')
    .select('id')
    .eq('department_id', id)
    .limit(1)

  if (categoriesError) {
    console.error('Error checking categories:', categoriesError)
    return { error: 'Erro ao verificar categorias vinculadas' }
  }

  if (categories && categories.length > 0) {
    return { error: 'Não é possível excluir um departamento com categorias de chamados vinculadas.' }
  }

  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting department:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  return { success: true }
}

// ============================================
// Role Actions
// ============================================

/**
 * Busca todos os cargos (globais e por departamento)
 */
export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select(`
      id,
      name,
      department_id,
      is_global,
      created_at,
      department:departments (
        id,
        name
      )
    `)
    .order('is_global', { ascending: false })
    .order('name')

  if (error) {
    console.error('Error fetching roles:', error)
    throw new Error('Erro ao buscar cargos')
  }

  // Buscar contagem de usuários por cargo
  const { data: userCounts, error: userCountError } = await supabase
    .from('user_roles')
    .select('role_id')

  if (userCountError) {
    console.error('Error fetching user counts:', userCountError)
  }

  // Contar usuários por cargo
  const usersByRole: Record<string, number> = {}
  ;(userCounts || []).forEach((ur: { role_id: string }) => {
    usersByRole[ur.role_id] = (usersByRole[ur.role_id] || 0) + 1
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((role: any) => ({
    id: role.id,
    name: role.name,
    department_id: role.department_id,
    department_name: role.department?.name || null,
    is_global: role.is_global || false,
    created_at: role.created_at,
    users_count: usersByRole[role.id] || 0,
  }))
}

/**
 * Busca cargos globais
 */
export async function getGlobalRoles(): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select(`
      id,
      name,
      department_id,
      is_global,
      created_at
    `)
    .eq('is_global', true)
    .order('name')

  if (error) {
    console.error('Error fetching global roles:', error)
    throw new Error('Erro ao buscar cargos globais')
  }

  // Buscar contagem de usuários por cargo
  const { data: userCounts, error: userCountError } = await supabase
    .from('user_roles')
    .select('role_id')

  if (userCountError) {
    console.error('Error fetching user counts:', userCountError)
  }

  // Contar usuários por cargo
  const usersByRole: Record<string, number> = {}
  ;(userCounts || []).forEach((ur: { role_id: string }) => {
    usersByRole[ur.role_id] = (usersByRole[ur.role_id] || 0) + 1
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((role: any) => ({
    id: role.id,
    name: role.name,
    department_id: null,
    department_name: null,
    is_global: true,
    created_at: role.created_at,
    users_count: usersByRole[role.id] || 0,
  }))
}

/**
 * Cria um novo cargo
 */
export async function createRole(data: {
  name: string
  department_id?: string | null
  is_global?: boolean
}) {
  const supabase = await createClient()

  const insertData = {
    name: data.name.trim(),
    department_id: data.is_global ? null : data.department_id,
    is_global: data.is_global || false,
  }

  const { data: role, error } = await supabase
    .from('roles')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating role:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  if (data.department_id) {
    revalidatePath(`/configuracoes/departamentos/${data.department_id}`)
  }
  return { success: true, data: role }
}

/**
 * Atualiza um cargo existente
 */
export async function updateRole(id: string, data: {
  name: string
  department_id?: string | null
  is_global?: boolean
}) {
  const supabase = await createClient()

  const updateData = {
    name: data.name.trim(),
    department_id: data.is_global ? null : data.department_id,
    is_global: data.is_global || false,
  }

  const { error } = await supabase
    .from('roles')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating role:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  if (data.department_id) {
    revalidatePath(`/configuracoes/departamentos/${data.department_id}`)
  }
  return { success: true }
}

/**
 * Exclui um cargo
 */
export async function deleteRole(id: string, departmentId?: string | null) {
  const supabase = await createClient()

  // Verificar se há usuários vinculados
  const { data: users, error: usersError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('role_id', id)
    .limit(1)

  if (usersError) {
    console.error('Error checking users:', usersError)
    return { error: 'Erro ao verificar usuários vinculados' }
  }

  if (users && users.length > 0) {
    return { error: 'Não é possível excluir um cargo com usuários vinculados. Remova os vínculos primeiro.' }
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting role:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/departamentos')
  if (departmentId) {
    revalidatePath(`/configuracoes/departamentos/${departmentId}`)
  }
  return { success: true }
}

/**
 * Busca usuários vinculados a um cargo
 */
export async function getUsersByRole(roleId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      user:profiles (
        id,
        full_name,
        email,
        avatar_url,
        status
      )
    `)
    .eq('role_id', roleId)

  if (error) {
    console.error('Error fetching users by role:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((ur: any) => ur.user).filter(Boolean)
}

// ============================================
// Auth Check
// ============================================

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

