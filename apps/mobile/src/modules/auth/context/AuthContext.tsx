/**
 * Gapp Mobile - Auth Context
 * 
 * Context provider para gerenciamento de estado de autenticação.
 * Integra com Supabase Auth e persiste sessão via AsyncStorage.
 */

import React, { createContext, useContext, useEffect, useCallback, useReducer } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import {
  AuthContextType,
  AuthState,
  AuthError,
  AuthProviderProps,
} from '../types/auth.types';
import * as authService from '../services/authService';

// Estado inicial
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isInitialized: false,
};

// Actions
type AuthAction =
  | { type: 'SET_SESSION'; payload: { user: User | null; session: Session | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'SET_INITIALIZED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return { ...initialState, isInitialized: true, loading: false };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicializa sessão ao montar
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      logger.info('AuthContext: Initializing authentication');

      try {
        const session = await authService.getSession();

        if (!mounted) return;

        if (session) {
          logger.info('AuthContext: Existing session found', {
            userId: session.user?.id,
            email: session.user?.email,
          });
          dispatch({
            type: 'SET_SESSION',
            payload: { user: session.user, session },
          });
        } else {
          logger.info('AuthContext: No existing session');
          dispatch({ type: 'SET_SESSION', payload: { user: null, session: null } });
        }
      } catch (error) {
        logger.error('AuthContext: Failed to initialize auth', { error });
        if (mounted) {
          dispatch({ type: 'SET_SESSION', payload: { user: null, session: null } });
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_INITIALIZED' });
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Listener para mudanças de estado de auth
  useEffect(() => {
    logger.debug('AuthContext: Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.info('AuthContext: Auth state changed', { event, userId: session?.user?.id });

        switch (event) {
          case 'SIGNED_IN':
            dispatch({
              type: 'SET_SESSION',
              payload: { user: session?.user ?? null, session },
            });
            break;

          case 'SIGNED_OUT':
            dispatch({ type: 'RESET' });
            break;

          case 'TOKEN_REFRESHED':
            logger.debug('AuthContext: Token refreshed');
            if (session) {
              dispatch({
                type: 'SET_SESSION',
                payload: { user: session.user, session },
              });
            }
            break;

          case 'USER_UPDATED':
            if (session) {
              dispatch({
                type: 'SET_SESSION',
                payload: { user: session.user, session },
              });
            }
            break;

          default:
            break;
        }
      }
    );

    return () => {
      logger.debug('AuthContext: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  // Actions
  const signIn = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      await authService.signIn(email, password);
      // O listener onAuthStateChange vai atualizar o estado
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as AuthError });
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await authService.signOut();
      // O listener onAuthStateChange vai atualizar o estado
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as AuthError });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      await authService.resetPassword(email);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as AuthError });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

