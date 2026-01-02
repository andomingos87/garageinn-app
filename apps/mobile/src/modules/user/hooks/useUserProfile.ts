/**
 * Gapp Mobile - useUserProfile Hook
 * 
 * Hook para gerenciar o estado do perfil operacional do usuário.
 * Integra com o serviço de perfil e mantém cache local.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../../../lib/observability';
import { UserProfile, UserProfileError, UserProfileState } from '../types/userProfile.types';
import * as userProfileService from '../services/userProfileService';

interface UseUserProfileOptions {
  /**
   * ID do usuário para buscar o perfil
   */
  userId: string | null;
  
  /**
   * Se deve carregar automaticamente ao montar
   * @default true
   */
  autoLoad?: boolean;
}

interface UseUserProfileReturn extends UserProfileState {
  /**
   * Recarrega o perfil do usuário
   */
  refetch: () => Promise<void>;
  
  /**
   * Limpa o perfil (logout)
   */
  clear: () => void;
}

/**
 * Hook para gerenciar o perfil operacional do usuário
 */
export function useUserProfile({
  userId,
  autoLoad = true,
}: UseUserProfileOptions): UseUserProfileReturn {
  const [state, setState] = useState<UserProfileState>({
    profile: null,
    loading: false,
    error: null,
    isInitialized: false,
  });

  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      logger.debug('useUserProfile: No userId provided, skipping fetch');
      setState((prev) => ({
        ...prev,
        profile: null,
        loading: false,
        error: null,
        isInitialized: true,
      }));
      return;
    }

    logger.info('useUserProfile: Fetching profile', { userId });
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await userProfileService.fetchUserProfile(userId);

      if (!mountedRef.current) return;

      logger.info('useUserProfile: Profile fetched successfully', {
        userId,
        unitScopeType: profile.unitScopeType,
      });

      setState({
        profile,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      if (!mountedRef.current) return;

      const profileError = error as UserProfileError;
      logger.error('useUserProfile: Failed to fetch profile', {
        userId,
        error: profileError,
      });

      setState((prev) => ({
        ...prev,
        profile: null,
        loading: false,
        error: profileError,
        isInitialized: true,
      }));
    }
  }, [userId]);

  const clear = useCallback(() => {
    logger.info('useUserProfile: Clearing profile');
    setState({
      profile: null,
      loading: false,
      error: null,
      isInitialized: true,
    });
  }, []);

  // Carrega automaticamente ao montar (se autoLoad)
  useEffect(() => {
    mountedRef.current = true;

    if (autoLoad && userId) {
      fetchProfile();
    } else if (!userId) {
      setState((prev) => ({
        ...prev,
        profile: null,
        isInitialized: true,
      }));
    }

    return () => {
      mountedRef.current = false;
    };
  }, [autoLoad, userId, fetchProfile]);

  return {
    ...state,
    refetch: fetchProfile,
    clear,
  };
}

