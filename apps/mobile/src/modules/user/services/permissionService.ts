/**
 * Gapp Mobile - Permission Service
 * 
 * Serviço para verificação de permissões (RBAC).
 * Implementa lógica de autorização baseada em roles e contexto.
 * 
 * IMPORTANTE: Este é um gating de UX. A segurança real é feita via RLS no Supabase.
 */

import { logger } from '../../../lib/observability';
import { UserProfile, UserUnit } from '../types/userProfile.types';
import {
  Permission,
  PermissionContext,
  PermissionCheckResult,
  RolePermissionMap,
  GateConfig,
} from '../types/permissions.types';

/**
 * Mapeamento de permissões por role
 */
const ROLE_PERMISSIONS: RolePermissionMap = {
  // Roles globais
  Administrador: [
    'checklist:execute_opening',
    'checklist:execute_supervision',
    'checklist:view_history',
    'checklist:view_all_units',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:view_all',
    'ticket:comment',
    'ticket:close_own',
    'ticket:triage',
    'ticket:assign',
    'unit:select',
    'unit:view_all',
    'admin:users',
    'admin:settings',
    'admin:reports',
  ],
  Desenvolvedor: [
    'checklist:execute_opening',
    'checklist:execute_supervision',
    'checklist:view_history',
    'checklist:view_all_units',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:view_all',
    'ticket:comment',
    'ticket:close_own',
    'unit:select',
    'unit:view_all',
    'admin:reports',
  ],
  Diretor: [
    'checklist:view_history',
    'checklist:view_all_units',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:view_all',
    'ticket:comment',
    'ticket:close_own',
    'ticket:triage',
    'ticket:assign',
    'unit:select',
    'unit:view_all',
    'admin:reports',
  ],
  
  // Roles de Operações
  Gerente: [
    'checklist:execute_opening',
    'checklist:execute_supervision',
    'checklist:view_history',
    'checklist:view_all_units',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:view_all',
    'ticket:comment',
    'ticket:close_own',
    'ticket:triage',
    'ticket:assign',
    'unit:select',
    'unit:view_all',
    'admin:reports',
  ],
  Supervisor: [
    'checklist:execute_opening',
    'checklist:execute_supervision',
    'checklist:view_history',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:comment',
    'ticket:close_own',
    'unit:select',
  ],
  Coordenador: [
    'checklist:execute_opening',
    'checklist:execute_supervision',
    'checklist:view_history',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:comment',
    'ticket:close_own',
    'unit:select',
  ],
  Encarregado: [
    'checklist:execute_opening',
    'checklist:view_history',
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:comment',
    'ticket:close_own',
  ],
  Manobrista: [
    'checklist:execute_opening',
    'checklist:view_history',
    'ticket:create',
    'ticket:view_own',
    'ticket:comment',
  ],
  
  // Roles de outros departamentos (acesso limitado)
  Analista: [
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:comment',
    'ticket:close_own',
  ],
  Auxiliar: [
    'ticket:create',
    'ticket:view_own',
    'ticket:comment',
  ],
  Comprador: [
    'ticket:create',
    'ticket:view_own',
    'ticket:view_unit',
    'ticket:comment',
    'ticket:close_own',
    'ticket:triage',
  ],
};

/**
 * Mensagens de negação de permissão
 */
const PERMISSION_DENIED_MESSAGES: Partial<Record<Permission, string>> = {
  'checklist:execute_opening': 'Você não tem permissão para executar checklists de abertura.',
  'checklist:execute_supervision': 'Apenas supervisores e gerentes podem executar checklists de supervisão.',
  'checklist:view_all_units': 'Você só pode ver checklists das suas unidades.',
  'ticket:create': 'Você não tem permissão para criar chamados.',
  'ticket:view_all': 'Você só pode ver chamados das suas unidades.',
  'ticket:triage': 'Apenas responsáveis podem fazer triagem de chamados.',
  'ticket:assign': 'Você não tem permissão para atribuir chamados.',
  'unit:select': 'Você não tem permissão para selecionar unidades.',
  'admin:users': 'Acesso restrito a administradores.',
  'admin:settings': 'Acesso restrito a administradores.',
};

/**
 * Obtém todas as permissões de um perfil baseado em seus roles
 */
export function getProfilePermissions(profile: UserProfile): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of profile.roles) {
    const rolePermissions = ROLE_PERMISSIONS[role.name] ?? [];
    rolePermissions.forEach((perm) => permissions.add(perm));
  }

  return Array.from(permissions);
}

/**
 * Verifica se o perfil tem uma permissão específica
 */
export function hasPermission(
  profile: UserProfile | null,
  permission: Permission,
  context?: PermissionContext
): PermissionCheckResult {
  if (!profile) {
    return {
      granted: false,
      reason: 'Usuário não autenticado.',
      softDeny: false,
    };
  }

  const permissions = getProfilePermissions(profile);
  const hasBasicPermission = permissions.includes(permission);

  // Se não tem permissão básica, nega
  if (!hasBasicPermission) {
    return {
      granted: false,
      reason: PERMISSION_DENIED_MESSAGES[permission] ?? 'Você não tem permissão para esta ação.',
      softDeny: true,
    };
  }

  // Verificações contextuais
  if (context?.unitId) {
    const canAccessUnit = canAccessUnitContext(profile, context.unitId);
    if (!canAccessUnit) {
      return {
        granted: false,
        reason: 'Você não tem acesso a esta unidade.',
        softDeny: true,
      };
    }
  }

  return { granted: true };
}

/**
 * Verifica se o perfil tem acesso a uma unidade específica
 */
export function canAccessUnitContext(
  profile: UserProfile,
  unitId: string
): boolean {
  // Admins, diretores e gerentes têm acesso a todas unidades
  if (profile.unitScopeType === 'all') {
    return true;
  }

  // Verifica se a unidade está nas unidades do usuário
  return profile.units.some((u) => u.unitId === unitId);
}

/**
 * Verifica múltiplas permissões (todas devem ser atendidas)
 */
export function hasAllPermissions(
  profile: UserProfile | null,
  permissions: Permission[],
  context?: PermissionContext
): PermissionCheckResult {
  if (!profile) {
    return {
      granted: false,
      reason: 'Usuário não autenticado.',
      softDeny: false,
    };
  }

  for (const permission of permissions) {
    const result = hasPermission(profile, permission, context);
    if (!result.granted) {
      return result;
    }
  }

  return { granted: true };
}

/**
 * Verifica múltiplas permissões (pelo menos uma deve ser atendida)
 */
export function hasAnyPermission(
  profile: UserProfile | null,
  permissions: Permission[],
  context?: PermissionContext
): PermissionCheckResult {
  if (!profile) {
    return {
      granted: false,
      reason: 'Usuário não autenticado.',
      softDeny: false,
    };
  }

  for (const permission of permissions) {
    const result = hasPermission(profile, permission, context);
    if (result.granted) {
      return result;
    }
  }

  return {
    granted: false,
    reason: 'Você não tem permissão para esta ação.',
    softDeny: true,
  };
}

/**
 * Verifica se o perfil tem um dos roles especificados
 */
export function hasAnyRole(
  profile: UserProfile | null,
  roleNames: string[]
): boolean {
  if (!profile) return false;
  return profile.roles.some((role) => roleNames.includes(role.name));
}

/**
 * Verifica acesso usando configuração de gate
 */
export function checkGate(
  profile: UserProfile | null,
  config: GateConfig,
  context?: PermissionContext
): PermissionCheckResult {
  if (!profile) {
    return {
      granted: false,
      reason: config.deniedMessage ?? 'Usuário não autenticado.',
      softDeny: false,
    };
  }

  // Verifica roles permitidos
  if (config.allowedRoles && config.allowedRoles.length > 0) {
    if (hasAnyRole(profile, config.allowedRoles)) {
      return { granted: true };
    }
  }

  // Verifica permissões obrigatórias (todas)
  if (config.requiredPermissions && config.requiredPermissions.length > 0) {
    const result = hasAllPermissions(profile, config.requiredPermissions, context);
    if (!result.granted) {
      return {
        ...result,
        reason: config.deniedMessage ?? result.reason,
      };
    }
  }

  // Verifica permissões alternativas (qualquer uma)
  if (config.anyOfPermissions && config.anyOfPermissions.length > 0) {
    const result = hasAnyPermission(profile, config.anyOfPermissions, context);
    if (!result.granted) {
      return {
        ...result,
        reason: config.deniedMessage ?? result.reason,
      };
    }
  }

  // Se nenhuma regra foi especificada, permite
  if (
    !config.allowedRoles?.length &&
    !config.requiredPermissions?.length &&
    !config.anyOfPermissions?.length
  ) {
    return { granted: true };
  }

  // Se chegou aqui e tinha allowedRoles mas não bateu, nega
  if (config.allowedRoles && config.allowedRoles.length > 0) {
    return {
      granted: false,
      reason: config.deniedMessage ?? 'Você não tem acesso a esta funcionalidade.',
      softDeny: true,
    };
  }

  return { granted: true };
}

/**
 * Filtra unidades baseado no escopo do usuário
 */
export function filterUnitsByScope(
  profile: UserProfile | null,
  allUnits: UserUnit[]
): UserUnit[] {
  if (!profile) return [];

  switch (profile.unitScopeType) {
    case 'all':
      return allUnits;
    case 'coverage':
      return profile.coverageUnits;
    case 'single':
      return profile.primaryUnit ? [profile.primaryUnit] : [];
    case 'none':
    default:
      return [];
  }
}

/**
 * Log de verificação de permissão (para debug)
 */
export function logPermissionCheck(
  profile: UserProfile | null,
  permission: Permission,
  result: PermissionCheckResult,
  context?: PermissionContext
): void {
  logger.debug('Permission check', {
    userId: profile?.id,
    permission,
    granted: result.granted,
    reason: result.reason,
    context,
  });
}

