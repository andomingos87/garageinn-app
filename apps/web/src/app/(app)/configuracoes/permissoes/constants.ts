import type { Permission } from '@/lib/auth/permissions'

// ============================================
// Types
// ============================================

export interface RoleWithPermissions {
  id: string
  name: string
  department_id: string | null
  department_name: string | null
  is_global: boolean
  permissions: Permission[]
}

export interface DepartmentWithRoles {
  id: string
  name: string
  roles: RoleWithPermissions[]
}

export interface PermissionGroup {
  name: string
  permissions: Permission[]
}

// ============================================
// Permission Groups (for UI organization)
// ============================================

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Usuários',
    permissions: ['users:read', 'users:create', 'users:update', 'users:delete', 'users:impersonate'],
  },
  {
    name: 'Unidades',
    permissions: ['units:read', 'units:create', 'units:update'],
  },
  {
    name: 'Chamados',
    permissions: ['tickets:read', 'tickets:create', 'tickets:triage', 'tickets:approve', 'tickets:execute'],
  },
  {
    name: 'Checklists',
    permissions: ['checklists:read', 'checklists:execute', 'checklists:configure'],
  },
  {
    name: 'Configurações',
    permissions: ['settings:read', 'settings:update'],
  },
  {
    name: 'Admin',
    permissions: ['admin:all'],
  },
]

// ============================================
// Permission Labels (for UI display)
// ============================================

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:read': 'Visualizar',
  'users:create': 'Criar',
  'users:update': 'Editar',
  'users:delete': 'Excluir',
  'users:impersonate': 'Personificar',
  'units:read': 'Visualizar',
  'units:create': 'Criar',
  'units:update': 'Editar',
  'tickets:read': 'Visualizar',
  'tickets:create': 'Criar',
  'tickets:triage': 'Triagem',
  'tickets:approve': 'Aprovar',
  'tickets:execute': 'Executar',
  'checklists:read': 'Visualizar',
  'checklists:execute': 'Executar',
  'checklists:configure': 'Configurar',
  'settings:read': 'Visualizar',
  'settings:update': 'Editar',
  'admin:all': 'Acesso Total',
}

