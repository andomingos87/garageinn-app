/**
 * Sistema de Permissões GAPP
 * 
 * Define as permissões disponíveis no sistema e a matriz de permissões
 * por cargo e departamento.
 * 
 * IMPORTANTE: Os nomes de cargos e departamentos devem corresponder EXATAMENTE
 * aos valores cadastrados no banco de dados.
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

/** 
 * Permissões por cargo dentro de cada departamento
 * 
 * NOTA: Os nomes devem corresponder EXATAMENTE ao banco de dados:
 * - Departamentos: Operações, Compras e Manutenção, Financeiro, TI, RH, Comercial, Auditoria, Sinistros
 * - Cargos comuns: Analista, Auxiliar, Coordenador, Gerente
 */
export const DEPARTMENT_ROLE_PERMISSIONS: Record<string, Record<string, Permission[]>> = {
  // ===== OPERAÇÕES =====
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
  },

  // ===== COMPRAS E MANUTENÇÃO =====
  'Compras e Manutenção': {
    'Auxiliar': [
      'tickets:read',
    ],
    'Analista': [
      'tickets:read',
      'tickets:execute',
    ],
    'Coordenador': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'tickets:triage',
      'settings:read',
    ],
  },

  // ===== FINANCEIRO =====
  'Financeiro': {
    'Auxiliar': [
      'tickets:read',
    ],
    'Analista': [
      'tickets:read',
      'tickets:approve',
    ],
    'Coordenador': [
      'tickets:read',
      'tickets:approve',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:approve',
      'settings:read',
    ],
  },

  // ===== TI =====
  'TI': {
    'Analista de Suporte': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
    ],
    'Desenvolvedor': [
      'admin:all',
    ],
    'Coordenador': [
      'tickets:read',
      'tickets:execute',
      'settings:read',
      'settings:update',
      'users:read',
    ],
    'Gerente': [
      'admin:all',
    ],
  },

  // ===== RH =====
  'RH': {
    'Auxiliar': [
      'users:read',
    ],
    'Analista': [
      'users:read',
      'users:create',
    ],
    'Coordenador': [
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
  },

  // ===== COMERCIAL =====
  'Comercial': {
    'Vendedor': [
      'units:read',
    ],
    'Analista': [
      'units:read',
    ],
    'Coordenador': [
      'units:read',
      'tickets:read',
    ],
    'Gerente': [
      'units:read',
      'tickets:read',
      'settings:read',
    ],
  },

  // ===== AUDITORIA =====
  'Auditoria': {
    'Auditor': [
      'tickets:read',
      'checklists:read',
    ],
    'Auditor Sênior': [
      'tickets:read',
      'tickets:approve',
      'checklists:read',
    ],
    'Coordenador': [
      'tickets:read',
      'tickets:approve',
      'checklists:read',
      'checklists:configure',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:approve',
      'checklists:read',
      'checklists:configure',
      'settings:read',
    ],
  },

  // ===== SINISTROS =====
  'Sinistros': {
    'Auxiliar': [
      'tickets:read',
    ],
    'Analista': [
      'tickets:read',
      'tickets:execute',
    ],
    'Coordenador': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
    ],
    'Gerente': [
      'tickets:read',
      'tickets:execute',
      'tickets:approve',
      'settings:read',
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

