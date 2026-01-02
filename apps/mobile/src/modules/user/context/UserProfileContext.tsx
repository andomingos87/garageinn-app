/**
 * Gapp Mobile - User Profile Context
 * 
 * Context provider para gerenciamento do perfil operacional do usuário.
 * Disponibiliza o perfil globalmente e integra com AuthContext.
 */

import React, { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import { logger } from '../../../lib/observability';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  UserProfile,
  UserProfileError,
  UserProfileState,
  UserUnit,
} from '../types/userProfile.types';
import * as userProfileService from '../services/userProfileService';

/**
 * Actions disponíveis no contexto
 */
interface UserProfileActions {
  refetch: () => Promise<void>;
  clear: () => void;
}

/**
 * Tipo completo do contexto
 */
type UserProfileContextType = UserProfileState & UserProfileActions;

/**
 * Props do provider
 */
interface UserProfileProviderProps {
  children: React.ReactNode;
}

// Estado inicial
const initialState: UserProfileState = {
  profile: null,
  loading: true,
  error: null,
  isInitialized: false,
};

// Actions
type UserProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: UserProfileError | null }
  | { type: 'SET_INITIALIZED' }
  | { type: 'CLEAR' }
  | { type: 'RESET' };

// Reducer
function userProfileReducer(
  state: UserProfileState,
  action: UserProfileAction
): UserProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, loading: false };
    case 'CLEAR':
      return { ...initialState, isInitialized: true, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

/**
 * Provider do perfil operacional do usuário
 */
export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [state, dispatch] = useReducer(userProfileReducer, initialState);
  const { user, isInitialized: authInitialized } = useAuth();

  // Carrega perfil quando usuário está autenticado
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      logger.debug('UserProfileContext: No user, clearing profile');
      dispatch({ type: 'CLEAR' });
      return;
    }

    logger.info('UserProfileContext: Fetching user profile', { userId: user.id });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const profile = await userProfileService.fetchUserProfile(user.id);

      logger.info('UserProfileContext: Profile loaded', {
        userId: user.id,
        unitScopeType: profile.unitScopeType,
        rolesCount: profile.roles.length,
      });

      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      logger.error('UserProfileContext: Failed to load profile', {
        userId: user.id,
        error,
      });
      dispatch({ type: 'SET_ERROR', payload: error as UserProfileError });
    }
  }, [user?.id]);

  // Limpa perfil
  const clear = useCallback(() => {
    logger.info('UserProfileContext: Clearing profile');
    dispatch({ type: 'CLEAR' });
  }, []);

  // Carrega perfil automaticamente quando auth é inicializado e há usuário
  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (user?.id) {
      fetchProfile();
    } else {
      dispatch({ type: 'CLEAR' });
    }
  }, [authInitialized, user?.id, fetchProfile]);

  const value: UserProfileContextType = {
    ...state,
    refetch: fetchProfile,
    clear,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do perfil do usuário
 */
export function useUserProfileContext(): UserProfileContextType {
  const context = useContext(UserProfileContext);

  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }

  return context;
}

/**
 * Hook utilitário para obter apenas o perfil (sem ações)
 * Útil para componentes que só precisam ler o perfil
 */
export function useProfile(): UserProfile | null {
  const { profile } = useUserProfileContext();
  return profile;
}

/**
 * Hook utilitário para obter unidades do usuário
 */
export function useUserUnits(): {
  units: UserUnit[];
  primaryUnit: UserUnit | null;
  coverageUnits: UserUnit[];
  unitScopeType: UserProfile['unitScopeType'] | null;
} {
  const { profile } = useUserProfileContext();

  return {
    units: profile?.units ?? [],
    primaryUnit: profile?.primaryUnit ?? null,
    coverageUnits: profile?.coverageUnits ?? [],
    unitScopeType: profile?.unitScopeType ?? null,
  };
}

