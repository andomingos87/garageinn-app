/**
 * Sistema de Permissões GAPP
 * 
 * Define as permissões disponíveis no sistema e a matriz de permissões
 * por cargo e departamento.
 */

/** Tipos de permissão disponíveis no sistema */
export type Permission =
  // Usuários
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:impersonate'
  // Unidades
  | 'units:read'
  | 'units:create'
  | 'units:update'
  // Chamados
  | 'tickets:read'
  | 'tickets:create'
  | 'tickets:triage'
  | 'tickets:approve'
  | 'tickets:execute'
  // Checklists
  | 'checklists:read'
  | 'checklists:execute'
  | 'checklists:configure'
  // Configurações
  | 'settings:read'
  | 'settings:update'
  // Admin total
  | 'admin:all'

/** Cargos globais têm permissões expandidas (não pertencem a departamento específico) */
export const GLOBAL_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Desenvolvedor': ['admin:all'],
  'Diretor': ['admin:all'],
  'Administrador': ['admin:all'],
}

/** Permissões por cargo dentro de cada departamento */
export const DEPARTMENT_ROLE_PERMISSIONS: Record<string, Record<string, Permission[]>> = {
  'Operações': {
    'Manobrista': [
      'tickets:read',
      'tickets:create',
      'checklists:read',
      'checklists:execute',
    ],
    'Encarregado': [
      'tickets:read',
      'tickets:create',
      'tickets:approve',
      'checklists:read',
      'checklists:execute',
      'units:read',
    ],
    'Supervisor': [
      'tickets:read',
      'tickets:create',
      'tickets:approve',
      'checklists:read',
      'checklists:execute',
      'units:read',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:create',
      'tickets:triage',
      'tickets:approve',
      'checklists:read',
      'checklists:execute',
      'checklists:configure',
      'units:read',
      'units:update',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'Compras': {
    'Comprador': [
      'tickets:read',
      'tickets:execute',
    ],
    'Analista Júnior': [
      'tickets:read',
      'tickets:execute',
    ],
    'Analista Pleno': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
    ],
    'Analista Sênior': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
    ],
    'Supervisor': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'Manutenção': {
    'Técnico': [
      'tickets:read',
      'tickets:execute',
      'checklists:read',
      'checklists:execute',
    ],
    'Analista Júnior': [
      'tickets:read',
      'tickets:execute',
      'checklists:read',
      'checklists:execute',
    ],
    'Analista Pleno': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'checklists:read',
      'checklists:execute',
    ],
    'Analista Sênior': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
      'checklists:read',
      'checklists:execute',
      'checklists:configure',
    ],
    'Supervisor': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
      'checklists:read',
      'checklists:execute',
      'checklists:configure',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
      'checklists:read',
      'checklists:execute',
      'checklists:configure',
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'Financeiro': {
    'Analista Júnior': [
      'tickets:read',
    ],
    'Analista Pleno': [
      'tickets:read',
      'tickets:approve',
    ],
    'Analista Sênior': [
      'tickets:read',
      'tickets:approve',
    ],
    'Supervisor': [
      'tickets:read',
      'tickets:approve',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:approve',
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'TI': {
    'Desenvolvedor': [
      'admin:all',
    ],
    'Analista Júnior': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
    ],
    'Analista Pleno': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
      'settings:update',
    ],
    'Analista Sênior': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
      'settings:update',
      'users:read',
    ],
    'Supervisor': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
      'settings:update',
      'users:read',
      'users:update',
    ],
    'Gerente': [
      'admin:all',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'RH': {
    'Analista Júnior': [
      'users:read',
    ],
    'Analista Pleno': [
      'users:read',
      'users:create',
    ],
    'Analista Sênior': [
      'users:read',
      'users:create',
      'users:update',
    ],
    'Supervisor': [
      'users:read',
      'users:create',
      'users:update',
    ],
    'Gerente': [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'Marketing': {
    'Analista Júnior': [],
    'Analista Pleno': [],
    'Analista Sênior': [],
    'Supervisor': [],
    'Gerente': [
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
  'Comercial': {
    'Analista Júnior': [
      'units:read',
    ],
    'Analista Pleno': [
      'units:read',
    ],
    'Analista Sênior': [
      'units:read',
    ],
    'Supervisor': [
      'units:read',
    ],
    'Gerente': [
      'units:read',
      'settings:read',
    ],
    'Diretor': [
      'admin:all',
    ],
  },
}

/** Lista de todas as permissões do sistema (para validação) */
export const ALL_PERMISSIONS: Permission[] = [
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'users:impersonate',
  'units:read',
  'units:create',
  'units:update',
  'tickets:read',
  'tickets:create',
  'tickets:triage',
  'tickets:approve',
  'tickets:execute',
  'checklists:read',
  'checklists:execute',
  'checklists:configure',
  'settings:read',
  'settings:update',
  'admin:all',
]

