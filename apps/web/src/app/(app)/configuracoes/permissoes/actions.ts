'use server'

import { createClient } from '@/lib/supabase/server'
import {
  Permission,
  GLOBAL_ROLE_PERMISSIONS,
  DEPARTMENT_ROLE_PERMISSIONS,
} from '@/lib/auth/permissions'
import type { RoleWithPermissions, DepartmentWithRoles } from './constants'

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna as permissões de um cargo baseado no nome e departamento
 */
function getPermissionsForRole(roleName: string, departmentName: string | null): Permission[] {
  // Verifica se é um cargo global
  if (GLOBAL_ROLE_PERMISSIONS[roleName]) {
    return GLOBAL_ROLE_PERMISSIONS[roleName]
  }

  // Verifica se é um cargo de departamento
  if (departmentName && DEPARTMENT_ROLE_PERMISSIONS[departmentName]?.[roleName]) {
    return DEPARTMENT_ROLE_PERMISSIONS[departmentName][roleName]
  }

  // Sem permissões definidas
  return []
}

// ============================================
// Server Actions
// ============================================

/**
 * Busca todos os cargos globais com suas permissões
 */
export async function getGlobalRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('id, name, department_id, is_global')
    .eq('is_global', true)
    .order('name')

  if (error) {
    console.error('Error fetching global roles:', error)
    throw new Error('Erro ao buscar cargos globais')
  }

  return (data || []).map((role) => ({
    id: role.id,
    name: role.name,
    department_id: role.department_id,
    department_name: null,
    is_global: true,
    permissions: getPermissionsForRole(role.name, null),
  }))
}

/**
 * Busca todos os departamentos com seus cargos e permissões
 */
export async function getDepartmentsWithRolesAndPermissions(): Promise<DepartmentWithRoles[]> {
  const supabase = await createClient()

  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  if (deptError) {
    console.error('Error fetching departments:', deptError)
    throw new Error('Erro ao buscar departamentos')
  }

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, department_id, is_global')
    .eq('is_global', false)
    .order('name')

  if (rolesError) {
    console.error('Error fetching roles:', rolesError)
    throw new Error('Erro ao buscar cargos')
  }

  // Organizar cargos por departamento
  const rolesByDepartment: Record<string, typeof roles> = {}
  ;(roles || []).forEach((role) => {
    if (role.department_id) {
      if (!rolesByDepartment[role.department_id]) {
        rolesByDepartment[role.department_id] = []
      }
      rolesByDepartment[role.department_id].push(role)
    }
  })

  return (departments || []).map((dept) => ({
    id: dept.id,
    name: dept.name,
    roles: (rolesByDepartment[dept.id] || []).map((role) => ({
      id: role.id,
      name: role.name,
      department_id: role.department_id,
      department_name: dept.name,
      is_global: false,
      permissions: getPermissionsForRole(role.name, dept.name),
    })),
  }))
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
