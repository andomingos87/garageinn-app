/**
 * Sistema RBAC (Role-Based Access Control)
 * 
 * Funções utilitárias para verificação de permissões baseadas em cargos.
 */

import {
  Permission,
  GLOBAL_ROLE_PERMISSIONS,
  DEPARTMENT_ROLE_PERMISSIONS,
} from './permissions'

/** Informação de cargo de um usuário */
export interface UserRole {
  role_name: string
  department_name: string | null
  is_global: boolean
}

/**
 * Obtém a lista de permissões de um usuário baseado em seus cargos
 */
export function getUserPermissions(roles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>()

  for (const role of roles) {
    // Cargos globais
    if (role.is_global) {
      const globalPerms = GLOBAL_ROLE_PERMISSIONS[role.role_name]
      if (globalPerms) {
        globalPerms.forEach((p) => permissions.add(p))
      }
    }

    // Cargos por departamento
    if (role.department_name) {
      const deptPerms = DEPARTMENT_ROLE_PERMISSIONS[role.department_name]?.[role.role_name]
      if (deptPerms) {
        deptPerms.forEach((p) => permissions.add(p))
      }
    }
  }

  return Array.from(permissions)
}

/**
 * Verifica se o usuário possui uma permissão específica
 */
export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  // Admin tem acesso a tudo
  if (userPermissions.includes('admin:all')) return true
  return userPermissions.includes(required)
}

/**
 * Verifica se o usuário possui ALGUMA das permissões listadas
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  if (userPermissions.includes('admin:all')) return true
  return required.some((p) => userPermissions.includes(p))
}

/**
 * Verifica se o usuário possui TODAS as permissões listadas
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  if (userPermissions.includes('admin:all')) return true
  return required.every((p) => userPermissions.includes(p))
}

/**
 * Verifica se o usuário é admin (possui admin:all)
 */
export function isAdmin(userPermissions: Permission[]): boolean {
  return userPermissions.includes('admin:all')
}

/**
 * Obtém permissões a partir de dados do banco (formato do select com joins)
 */
export function extractPermissionsFromUserRoles(
  userRoles: Array<{
    role: {
      name: string
      is_global: boolean | null
      department?: { name: string } | null
    } | null
  }>
): Permission[] {
  const roles: UserRole[] = userRoles
    .filter((ur): ur is { role: NonNullable<typeof ur.role> } => ur.role !== null)
    .map((ur) => ({
      role_name: ur.role.name,
      department_name: ur.role.department?.name ?? null,
      is_global: ur.role.is_global ?? false,
    }))

  return getUserPermissions(roles)
}

