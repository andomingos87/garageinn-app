import {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  type UserRole,
} from '../rbac'
import type { Permission } from '../permissions'

describe('getUserPermissions', () => {
  it('returns admin:all for global Administrador role', () => {
    const roles: UserRole[] = [
      { role_name: 'Administrador', department_name: null, is_global: true }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('admin:all')
  })

  it('returns admin:all for global Desenvolvedor role', () => {
    const roles: UserRole[] = [
      { role_name: 'Desenvolvedor', department_name: null, is_global: true }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('admin:all')
  })

  it('returns admin:all for global Diretor role', () => {
    const roles: UserRole[] = [
      { role_name: 'Diretor', department_name: null, is_global: true }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('admin:all')
  })

  it('returns correct permissions for Operações Manobrista', () => {
    const roles: UserRole[] = [
      { role_name: 'Manobrista', department_name: 'Operações', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('tickets:read')
    expect(permissions).toContain('tickets:create')
    expect(permissions).toContain('checklists:read')
    expect(permissions).toContain('checklists:execute')
    expect(permissions).not.toContain('admin:all')
    expect(permissions).not.toContain('users:read')
  })

  it('returns correct permissions for RH Analista', () => {
    const roles: UserRole[] = [
      { role_name: 'Analista', department_name: 'RH', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('users:read')
    expect(permissions).toContain('users:create')
    expect(permissions).not.toContain('users:delete')
    expect(permissions).not.toContain('admin:all')
  })

  it('returns correct permissions for Comercial Vendedor', () => {
    const roles: UserRole[] = [
      { role_name: 'Vendedor', department_name: 'Comercial', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('units:read')
    expect(permissions).not.toContain('admin:all')
  })

  it('returns correct permissions for Auditoria Auditor', () => {
    const roles: UserRole[] = [
      { role_name: 'Auditor', department_name: 'Auditoria', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('tickets:read')
    expect(permissions).toContain('checklists:read')
    expect(permissions).not.toContain('tickets:approve')
  })

  it('returns correct permissions for Sinistros Coordenador', () => {
    const roles: UserRole[] = [
      { role_name: 'Coordenador', department_name: 'Sinistros', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('tickets:read')
    expect(permissions).toContain('tickets:execute')
    expect(permissions).toContain('tickets:approve')
  })

  it('returns correct permissions for Compras e Manutenção Gerente', () => {
    const roles: UserRole[] = [
      { role_name: 'Gerente', department_name: 'Compras e Manutenção', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toContain('tickets:read')
    expect(permissions).toContain('tickets:execute')
    expect(permissions).toContain('tickets:approve')
    expect(permissions).toContain('tickets:triage')
    expect(permissions).toContain('settings:read')
  })

  it('combines permissions from multiple roles', () => {
    const roles: UserRole[] = [
      { role_name: 'Analista', department_name: 'RH', is_global: false },
      { role_name: 'Vendedor', department_name: 'Comercial', is_global: false },
    ]
    
    const permissions = getUserPermissions(roles)
    
    // From RH Analista
    expect(permissions).toContain('users:read')
    expect(permissions).toContain('users:create')
    // From Comercial Vendedor
    expect(permissions).toContain('units:read')
  })

  it('returns empty array for unmapped role', () => {
    const roles: UserRole[] = [
      { role_name: 'RoleQueNaoExiste', department_name: 'DepartamentoInexistente', is_global: false }
    ]
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toEqual([])
  })

  it('returns empty array for empty roles array', () => {
    const roles: UserRole[] = []
    
    const permissions = getUserPermissions(roles)
    
    expect(permissions).toEqual([])
  })
})

describe('hasPermission', () => {
  it('returns true when user has the permission', () => {
    const permissions: Permission[] = ['users:read', 'users:create']
    
    expect(hasPermission(permissions, 'users:read')).toBe(true)
    expect(hasPermission(permissions, 'users:create')).toBe(true)
  })

  it('returns false when user does not have the permission', () => {
    const permissions: Permission[] = ['users:read']
    
    expect(hasPermission(permissions, 'users:delete')).toBe(false)
  })

  it('returns true for any permission when user has admin:all', () => {
    const permissions: Permission[] = ['admin:all']
    
    expect(hasPermission(permissions, 'users:read')).toBe(true)
    expect(hasPermission(permissions, 'users:delete')).toBe(true)
    expect(hasPermission(permissions, 'settings:update')).toBe(true)
    expect(hasPermission(permissions, 'tickets:triage')).toBe(true)
  })
})

describe('hasAnyPermission', () => {
  it('returns true when user has at least one of the permissions', () => {
    const permissions: Permission[] = ['users:read', 'tickets:read']
    
    expect(hasAnyPermission(permissions, ['users:read', 'users:delete'])).toBe(true)
    expect(hasAnyPermission(permissions, ['tickets:read', 'tickets:create'])).toBe(true)
  })

  it('returns false when user has none of the permissions', () => {
    const permissions: Permission[] = ['users:read']
    
    expect(hasAnyPermission(permissions, ['users:delete', 'settings:update'])).toBe(false)
  })

  it('returns true for any permission when user has admin:all', () => {
    const permissions: Permission[] = ['admin:all']
    
    expect(hasAnyPermission(permissions, ['users:delete', 'settings:update'])).toBe(true)
  })
})

describe('hasAllPermissions', () => {
  it('returns true when user has all the permissions', () => {
    const permissions: Permission[] = ['users:read', 'users:create', 'users:update']
    
    expect(hasAllPermissions(permissions, ['users:read', 'users:create'])).toBe(true)
  })

  it('returns false when user is missing any permission', () => {
    const permissions: Permission[] = ['users:read', 'users:create']
    
    expect(hasAllPermissions(permissions, ['users:read', 'users:delete'])).toBe(false)
  })

  it('returns true for any permission set when user has admin:all', () => {
    const permissions: Permission[] = ['admin:all']
    
    expect(hasAllPermissions(permissions, ['users:read', 'users:delete', 'settings:update'])).toBe(true)
  })
})

describe('isAdmin', () => {
  it('returns true when user has admin:all', () => {
    const permissions: Permission[] = ['admin:all']
    
    expect(isAdmin(permissions)).toBe(true)
  })

  it('returns true when user has admin:all among other permissions', () => {
    const permissions: Permission[] = ['users:read', 'admin:all', 'tickets:read']
    
    expect(isAdmin(permissions)).toBe(true)
  })

  it('returns false when user does not have admin:all', () => {
    const permissions: Permission[] = ['users:read', 'users:create', 'tickets:read']
    
    expect(isAdmin(permissions)).toBe(false)
  })

  it('returns false for empty permissions', () => {
    const permissions: Permission[] = []
    
    expect(isAdmin(permissions)).toBe(false)
  })
})

