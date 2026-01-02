/**
 * Gapp Mobile - User Profile Service
 * 
 * Serviço para buscar e gerenciar o perfil operacional do usuário.
 * Integra com Supabase para obter dados de perfil, cargos e unidades.
 */

import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import {
  UserProfile,
  UserUnit,
  Role,
  UnitScopeType,
  UserProfileError,
  ProfileDbResponse,
  UserRoleDbResponse,
  UserUnitDbResponse,
} from '../types/userProfile.types';

/**
 * Roles conhecidos que indicam permissões de alto nível
 */
const ADMIN_ROLES = ['Administrador'];
const DEVELOPER_ROLES = ['Desenvolvedor'];
const DIRECTOR_ROLES = ['Diretor'];
const MANAGER_ROLES = ['Gerente', 'Gerente de Manutenção'];
const SUPERVISOR_ROLES = ['Supervisor', 'Supervisor de Manutenção', 'Coordenador'];
const OPERATIONAL_ROLES = ['Manobrista', 'Encarregado', 'Técnico de Manutenção', 'Auxiliar'];

/**
 * Mapeia resposta do banco para Role
 */
function mapDbToRole(dbRole: UserRoleDbResponse): Role {
  return {
    id: dbRole.roles.id,
    name: dbRole.roles.name,
    departmentId: dbRole.roles.department_id,
    departmentName: dbRole.roles.departments?.name ?? null,
    isGlobal: dbRole.roles.is_global,
  };
}

/**
 * Mapeia resposta do banco para UserUnit
 */
function mapDbToUserUnit(dbUnit: UserUnitDbResponse): UserUnit {
  return {
    id: dbUnit.id,
    unitId: dbUnit.unit_id,
    name: dbUnit.units.name,
    code: dbUnit.units.code,
    isCoverage: dbUnit.is_coverage,
  };
}

/**
 * Determina o tipo de escopo de unidades do usuário
 */
function determineUnitScopeType(
  units: UserUnit[],
  roles: Role[]
): UnitScopeType {
  // Se é admin, diretor ou gerente global, tem acesso a todas unidades
  const hasAllAccess = roles.some(
    (role) =>
      ADMIN_ROLES.includes(role.name) ||
      DIRECTOR_ROLES.includes(role.name) ||
      (MANAGER_ROLES.includes(role.name) && role.isGlobal)
  );
  if (hasAllAccess) return 'all';

  // Se não tem unidades vinculadas
  if (units.length === 0) return 'none';

  // Se tem unidades de cobertura
  const coverageUnits = units.filter((u) => u.isCoverage);
  if (coverageUnits.length > 0) return 'coverage';

  // Se tem apenas 1 unidade
  if (units.length === 1) return 'single';

  // Se tem múltiplas unidades sem cobertura, considera como cobertura
  return 'coverage';
}

/**
 * Verifica se o usuário possui determinado tipo de role
 */
function hasRoleType(roles: Role[], roleNames: string[]): boolean {
  return roles.some((role) => roleNames.includes(role.name));
}

/**
 * Busca o perfil operacional completo do usuário
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  logger.info('UserProfileService: Fetching user profile', { userId });

  try {
    // Busca dados básicos do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, status')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('UserProfileService: Failed to fetch profile', {
        userId,
        error: profileError,
      });
      throw createProfileError('fetch_failed', profileError);
    }

    if (!profileData) {
      logger.warn('UserProfileService: Profile not found', { userId });
      throw createProfileError('profile_not_found');
    }

    const profile = profileData as ProfileDbResponse;

    // Busca roles do usuário
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        id,
        role_id,
        roles (
          id,
          name,
          department_id,
          is_global,
          departments (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (rolesError) {
      logger.error('UserProfileService: Failed to fetch user roles', {
        userId,
        error: rolesError,
      });
      throw createProfileError('fetch_failed', rolesError);
    }

    const roles: Role[] = (rolesData as unknown as UserRoleDbResponse[])?.map(mapDbToRole) ?? [];

    // Busca unidades do usuário
    const { data: unitsData, error: unitsError } = await supabase
      .from('user_units')
      .select(`
        id,
        unit_id,
        is_coverage,
        units (
          id,
          name,
          code
        )
      `)
      .eq('user_id', userId);

    if (unitsError) {
      logger.error('UserProfileService: Failed to fetch user units', {
        userId,
        error: unitsError,
      });
      throw createProfileError('fetch_failed', unitsError);
    }

    const units: UserUnit[] = (unitsData as unknown as UserUnitDbResponse[])?.map(mapDbToUserUnit) ?? [];

    // Calcula escopo e flags
    const unitScopeType = determineUnitScopeType(units, roles);
    const coverageUnits = units.filter((u) => u.isCoverage);
    const primaryUnit = units.find((u) => !u.isCoverage) ?? units[0] ?? null;

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      status: profile.status as UserProfile['status'],
      
      roles,
      units,
      
      unitScopeType,
      primaryUnit,
      coverageUnits,
      
      isAdmin: hasRoleType(roles, ADMIN_ROLES),
      isDeveloper: hasRoleType(roles, DEVELOPER_ROLES),
      isDirector: hasRoleType(roles, DIRECTOR_ROLES),
      isManager: hasRoleType(roles, MANAGER_ROLES),
      isSupervisor: hasRoleType(roles, SUPERVISOR_ROLES),
      isOperational: hasRoleType(roles, OPERATIONAL_ROLES),
    };

    logger.info('UserProfileService: Profile fetched successfully', {
      userId,
      rolesCount: roles.length,
      unitsCount: units.length,
      unitScopeType,
    });

    return userProfile;
  } catch (error) {
    if ((error as UserProfileError).code) {
      throw error;
    }
    logger.error('UserProfileService: Unexpected error fetching profile', {
      userId,
      error,
    });
    throw createProfileError('unknown', error as Error);
  }
}

/**
 * Busca todas as unidades ativas (para seleção em formulários)
 */
export async function fetchAllUnits(): Promise<UserUnit[]> {
  logger.info('UserProfileService: Fetching all units');

  try {
    const { data, error } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('status', 'active')
      .order('name');

    if (error) {
      logger.error('UserProfileService: Failed to fetch units', { error });
      throw createProfileError('fetch_failed', error);
    }

    return (data ?? []).map((unit) => ({
      id: '', // Não é user_units, então não tem id de vínculo
      unitId: unit.id,
      name: unit.name,
      code: unit.code,
      isCoverage: false,
    }));
  } catch (error) {
    if ((error as UserProfileError).code) {
      throw error;
    }
    logger.error('UserProfileService: Unexpected error fetching units', { error });
    throw createProfileError('unknown', error as Error);
  }
}

/**
 * Cria um erro normalizado do perfil do usuário
 */
function createProfileError(
  code: UserProfileError['code'],
  originalError?: Error | unknown
): UserProfileError {
  const messages: Record<UserProfileError['code'], string> = {
    profile_not_found: 'Perfil não encontrado. Entre em contato com o suporte.',
    fetch_failed: 'Não foi possível carregar o perfil. Tente novamente.',
    network_error: 'Sem conexão com a internet. Verifique sua conexão.',
    unauthorized: 'Acesso não autorizado. Faça login novamente.',
    unknown: 'Ocorreu um erro. Tente novamente.',
  };

  return {
    code,
    message: messages[code],
    originalError: originalError instanceof Error ? originalError : undefined,
  };
}

