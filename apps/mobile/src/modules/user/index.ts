/**
 * Gapp Mobile - User Module
 * 
 * Módulo de gerenciamento de perfil operacional do usuário.
 * Inclui tipos, serviços, hooks e contexto para RBAC.
 */

// Types
export * from './types/userProfile.types';
export * from './types/permissions.types';

// Services
export * as userProfileService from './services/userProfileService';
export * as permissionService from './services/permissionService';

// Hooks
export { useUserProfile } from './hooks/useUserProfile';
export { usePermissions, useCan, useGate } from './hooks/usePermissions';

// Context
export {
  UserProfileProvider,
  useUserProfileContext,
  useProfile,
  useUserUnits,
} from './context/UserProfileContext';

