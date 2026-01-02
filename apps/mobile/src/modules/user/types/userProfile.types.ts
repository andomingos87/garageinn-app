/**
 * Gapp Mobile - User Profile Types
 * 
 * Tipos TypeScript para o "perfil operacional" do usuário.
 * Inclui vínculos de departamentos, cargos, unidades e cobertura.
 */

/**
 * Departamento do sistema
 */
export interface Department {
  id: string;
  name: string;
}

/**
 * Cargo/Role do usuário
 */
export interface Role {
  id: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  isGlobal: boolean;
}

/**
 * Unidade vinculada ao usuário
 */
export interface UserUnit {
  id: string;
  unitId: string;
  name: string;
  code: string;
  isCoverage: boolean;
}

/**
 * Tipo de escopo de unidades do usuário
 * - 'single': usuário tem apenas 1 unidade (ex: Manobrista, Encarregado)
 * - 'coverage': usuário tem múltiplas unidades de cobertura (ex: Supervisor)
 * - 'all': usuário tem acesso a todas unidades (ex: Gerente, Admin)
 * - 'none': usuário não tem unidade vinculada (ex: usuário administrativo)
 */
export type UnitScopeType = 'single' | 'coverage' | 'all' | 'none';

/**
 * Perfil operacional do usuário
 * Contém todas as informações necessárias para RBAC no mobile
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: 'active' | 'inactive' | 'pending';
  
  // Vínculos
  roles: Role[];
  units: UserUnit[];
  
  // Escopo calculado
  unitScopeType: UnitScopeType;
  primaryUnit: UserUnit | null;
  coverageUnits: UserUnit[];
  
  // Flags de permissão de alto nível (calculadas)
  isAdmin: boolean;
  isDeveloper: boolean;
  isDirector: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isOperational: boolean;
}

/**
 * Estado do contexto de perfil do usuário
 */
export interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: UserProfileError | null;
  isInitialized: boolean;
}

/**
 * Códigos de erro do perfil do usuário
 */
export type UserProfileErrorCode = 
  | 'profile_not_found'
  | 'fetch_failed'
  | 'network_error'
  | 'unauthorized'
  | 'unknown';

/**
 * Erro do perfil do usuário
 */
export interface UserProfileError {
  code: UserProfileErrorCode;
  message: string;
  originalError?: Error;
}

/**
 * Mensagens de erro em PT-BR
 */
export const USER_PROFILE_ERROR_MESSAGES: Record<UserProfileErrorCode, string> = {
  profile_not_found: 'Perfil não encontrado. Entre em contato com o suporte.',
  fetch_failed: 'Não foi possível carregar o perfil. Tente novamente.',
  network_error: 'Sem conexão com a internet. Verifique sua conexão.',
  unauthorized: 'Acesso não autorizado. Faça login novamente.',
  unknown: 'Ocorreu um erro. Tente novamente.',
};

/**
 * Resposta raw do banco de dados para perfil do usuário
 */
export interface ProfileDbResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
}

/**
 * Resposta raw do banco de dados para roles do usuário
 */
export interface UserRoleDbResponse {
  id: string;
  role_id: string;
  roles: {
    id: string;
    name: string;
    department_id: string | null;
    is_global: boolean;
    departments: {
      id: string;
      name: string;
    } | null;
  };
}

/**
 * Resposta raw do banco de dados para unidades do usuário
 */
export interface UserUnitDbResponse {
  id: string;
  unit_id: string;
  is_coverage: boolean;
  units: {
    id: string;
    name: string;
    code: string;
  };
}

