/**
 * Gapp Mobile - usePermissions Hook
 * 
 * Hook para verificação de permissões baseado no perfil do usuário.
 * Facilita o gating de UI em componentes React.
 */

import { useMemo, useCallback } from 'react';
import { useUserProfileContext } from '../context/UserProfileContext';
import {
  Permission,
  PermissionContext,
  PermissionCheckResult,
  GateConfig,
} from '../types/permissions.types';
import * as permissionService from '../services/permissionService';

interface UsePermissionsReturn {
  /**
   * Verifica se tem uma permissão específica
   */
  can: (permission: Permission, context?: PermissionContext) => boolean;
  
  /**
   * Verifica permissão com resultado detalhado
   */
  check: (permission: Permission, context?: PermissionContext) => PermissionCheckResult;
  
  /**
   * Verifica se tem todas as permissões (AND)
   */
  canAll: (permissions: Permission[], context?: PermissionContext) => boolean;
  
  /**
   * Verifica se tem alguma das permissões (OR)
   */
  canAny: (permissions: Permission[], context?: PermissionContext) => boolean;
  
  /**
   * Verifica acesso baseado em config de gate
   */
  checkGate: (config: GateConfig, context?: PermissionContext) => PermissionCheckResult;
  
  /**
   * Verifica se tem um dos roles especificados
   */
  hasRole: (roleNames: string[]) => boolean;
  
  /**
   * Verifica se pode acessar uma unidade específica
   */
  canAccessUnit: (unitId: string) => boolean;
  
  /**
   * Lista de todas as permissões do usuário
   */
  permissions: Permission[];
  
  /**
   * Se o perfil está carregando
   */
  loading: boolean;
  
  /**
   * Se o usuário é admin
   */
  isAdmin: boolean;
  
  /**
   * Se o usuário é supervisor ou superior
   */
  isSupervisorOrAbove: boolean;
  
  /**
   * Se o usuário é operacional (Manobrista/Encarregado)
   */
  isOperational: boolean;
}

/**
 * Hook para verificação de permissões
 */
export function usePermissions(): UsePermissionsReturn {
  const { profile, loading } = useUserProfileContext();

  // Memoiza lista de permissões
  const permissions = useMemo(() => {
    if (!profile) return [];
    return permissionService.getProfilePermissions(profile);
  }, [profile]);

  // Verifica uma permissão
  const can = useCallback(
    (permission: Permission, context?: PermissionContext): boolean => {
      const result = permissionService.hasPermission(profile, permission, context);
      return result.granted;
    },
    [profile]
  );

  // Verifica uma permissão com resultado detalhado
  const check = useCallback(
    (permission: Permission, context?: PermissionContext): PermissionCheckResult => {
      return permissionService.hasPermission(profile, permission, context);
    },
    [profile]
  );

  // Verifica todas as permissões
  const canAll = useCallback(
    (perms: Permission[], context?: PermissionContext): boolean => {
      const result = permissionService.hasAllPermissions(profile, perms, context);
      return result.granted;
    },
    [profile]
  );

  // Verifica qualquer permissão
  const canAny = useCallback(
    (perms: Permission[], context?: PermissionContext): boolean => {
      const result = permissionService.hasAnyPermission(profile, perms, context);
      return result.granted;
    },
    [profile]
  );

  // Verifica gate
  const checkGate = useCallback(
    (config: GateConfig, context?: PermissionContext): PermissionCheckResult => {
      return permissionService.checkGate(profile, config, context);
    },
    [profile]
  );

  // Verifica roles
  const hasRole = useCallback(
    (roleNames: string[]): boolean => {
      return permissionService.hasAnyRole(profile, roleNames);
    },
    [profile]
  );

  // Verifica acesso a unidade
  const canAccessUnit = useCallback(
    (unitId: string): boolean => {
      if (!profile) return false;
      return permissionService.canAccessUnitContext(profile, unitId);
    },
    [profile]
  );

  // Flags de alto nível memoizadas
  const isAdmin = useMemo(() => profile?.isAdmin ?? false, [profile]);
  const isSupervisorOrAbove = useMemo(
    () =>
      profile?.isAdmin ||
      profile?.isDirector ||
      profile?.isManager ||
      profile?.isSupervisor ||
      false,
    [profile]
  );
  const isOperational = useMemo(() => profile?.isOperational ?? false, [profile]);

  return {
    can,
    check,
    canAll,
    canAny,
    checkGate,
    hasRole,
    canAccessUnit,
    permissions,
    loading,
    isAdmin,
    isSupervisorOrAbove,
    isOperational,
  };
}

/**
 * Hook simplificado para verificar uma única permissão
 */
export function useCan(
  permission: Permission,
  context?: PermissionContext
): { can: boolean; loading: boolean; reason?: string } {
  const { check, loading } = usePermissions();
  
  const result = useMemo(
    () => check(permission, context),
    [check, permission, context]
  );

  return {
    can: result.granted,
    loading,
    reason: result.reason,
  };
}

/**
 * Hook para verificar acesso a gate
 */
export function useGate(
  config: GateConfig,
  context?: PermissionContext
): { granted: boolean; loading: boolean; reason?: string } {
  const { checkGate, loading } = usePermissions();
  
  const result = useMemo(
    () => checkGate(config, context),
    [checkGate, config, context]
  );

  return {
    granted: result.granted,
    loading,
    reason: result.reason,
  };
}

