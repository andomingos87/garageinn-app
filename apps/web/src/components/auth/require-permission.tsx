'use client'

import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/lib/auth/permissions'

interface RequirePermissionProps {
  /** Permissão ou lista de permissões necessárias */
  permission: Permission | Permission[]
  /** Modo de verificação: 'any' (alguma) ou 'all' (todas) */
  mode?: 'any' | 'all'
  /** Conteúdo a ser exibido se o usuário tiver permissão */
  children: React.ReactNode
  /** Conteúdo alternativo se o usuário não tiver permissão */
  fallback?: React.ReactNode
}

/**
 * Componente para renderização condicional baseada em permissões
 * 
 * @example
 * // Exibir apenas para quem pode criar usuários
 * <RequirePermission permission="users:create">
 *   <Button>Criar Usuário</Button>
 * </RequirePermission>
 * 
 * @example
 * // Exibir se tiver qualquer uma das permissões
 * <RequirePermission permission={['users:read', 'admin:all']} mode="any">
 *   <UserList />
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  mode = 'any',
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { can, canAny, canAll, isLoading } = usePermissions()

  // Não renderiza nada enquanto carrega
  if (isLoading) return null

  const perms = Array.isArray(permission) ? permission : [permission]
  const hasAccess = mode === 'all' ? canAll(perms) : canAny(perms)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Componente para exibir conteúdo apenas para admins
 * 
 * @example
 * <RequireAdmin>
 *   <AdminPanel />
 * </RequireAdmin>
 */
export function RequireAdmin({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isAdmin, isLoading } = usePermissions()

  if (isLoading) return null

  return isAdmin ? <>{children}</> : <>{fallback}</>
}

