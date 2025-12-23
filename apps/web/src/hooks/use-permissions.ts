'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  type UserRole,
} from '@/lib/auth/rbac'
import type { Permission } from '@/lib/auth/permissions'

interface UsePermissionsReturn {
  permissions: Permission[]
  isLoading: boolean
  /** Verifica se o usuário tem uma permissão específica */
  can: (permission: Permission) => boolean
  /** Verifica se o usuário tem ALGUMA das permissões */
  canAny: (permissions: Permission[]) => boolean
  /** Verifica se o usuário tem TODAS as permissões */
  canAll: (permissions: Permission[]) => boolean
  /** Verifica se o usuário é admin */
  isAdmin: boolean
}

/**
 * Hook para verificar permissões do usuário atual
 * 
 * @example
 * const { can, isAdmin } = usePermissions()
 * 
 * if (can('users:create')) {
 *   // mostrar botão de criar usuário
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isLoading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPermissions() {
      if (!user) {
        setPermissions([])
        setIsLoading(false)
        return
      }

      const supabase = createClient()

      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles (
            name,
            is_global,
            department:departments (
              name
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user roles:', error)
        setPermissions([])
        setIsLoading(false)
        return
      }

      // Transformar para o formato esperado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roles: UserRole[] = (userRoles || [])
        .filter((ur: any) => ur.role !== null)
        .map((ur: any) => ({
          role_name: ur.role.name,
          department_name: ur.role.department?.name ?? null,
          is_global: ur.role.is_global ?? false,
        }))

      const userPermissions = getUserPermissions(roles)
      setPermissions(userPermissions)
      setIsLoading(false)
    }

    if (!authLoading) {
      fetchPermissions()
    }
  }, [user, authLoading])

  return {
    permissions,
    isLoading: authLoading || isLoading,
    can: (permission: Permission) => hasPermission(permissions, permission),
    canAny: (perms: Permission[]) => hasAnyPermission(permissions, perms),
    canAll: (perms: Permission[]) => hasAllPermissions(permissions, perms),
    isAdmin: isAdmin(permissions),
  }
}

