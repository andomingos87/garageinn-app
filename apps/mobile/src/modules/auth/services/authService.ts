/**
 * Gapp Mobile - Auth Service
 * 
 * Serviço de autenticação usando Supabase Auth.
 * Centraliza todas as operações de autenticação.
 */

import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';
import { AuthError, AuthErrorCode, AUTH_ERROR_MESSAGES } from '../types/auth.types';
import { logger } from '../../../lib/observability';

/**
 * Normaliza erros do Supabase para formato interno
 */
export function normalizeAuthError(error: SupabaseAuthError | Error | unknown): AuthError {
  // Erro de rede
  if (error instanceof TypeError && error.message.includes('Network')) {
    return {
      code: 'network_error',
      message: AUTH_ERROR_MESSAGES.network_error,
      originalError: error,
    };
  }

  // Erro do Supabase
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as SupabaseAuthError;
    const message = supabaseError.message?.toLowerCase() || '';

    let code: AuthErrorCode = 'unknown';

    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      code = 'invalid_credentials';
    } else if (message.includes('invalid email') || message.includes('invalid_email')) {
      code = 'invalid_email';
    } else if (message.includes('user not found') || message.includes('user_not_found')) {
      code = 'user_not_found';
    } else if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
      code = 'email_not_confirmed';
    } else if (message.includes('rate limit') || message.includes('too many requests')) {
      code = 'too_many_requests';
    } else if (message.includes('network') || message.includes('fetch')) {
      code = 'network_error';
    } else if (message.includes('session') && message.includes('expired')) {
      code = 'session_expired';
    }

    return {
      code,
      message: AUTH_ERROR_MESSAGES[code],
      originalError: supabaseError,
    };
  }

  return {
    code: 'unknown',
    message: AUTH_ERROR_MESSAGES.unknown,
    originalError: error instanceof Error ? error : undefined,
  };
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida senha (mínimo 6 caracteres)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Realiza login com email e senha
 */
export async function signIn(email: string, password: string): Promise<void> {
  logger.info('AuthService: Attempting sign in', { email });

  if (!validateEmail(email)) {
    throw {
      code: 'invalid_email',
      message: AUTH_ERROR_MESSAGES.invalid_email,
    } as AuthError;
  }

  if (!validatePassword(password)) {
    throw {
      code: 'invalid_credentials',
      message: 'A senha deve ter pelo menos 6 caracteres',
    } as AuthError;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      logger.warn('AuthService: Sign in failed', { 
        email, 
        errorMessage: error.message,
        errorCode: error.code,
      });
      throw normalizeAuthError(error);
    }

    if (!data.session) {
      throw {
        code: 'unknown',
        message: AUTH_ERROR_MESSAGES.unknown,
      } as AuthError;
    }

    logger.info('AuthService: Sign in successful', { 
      userId: data.user?.id,
      email: data.user?.email,
    });
  } catch (error) {
    if ((error as AuthError).code) {
      throw error;
    }
    throw normalizeAuthError(error);
  }
}

/**
 * Realiza logout
 */
export async function signOut(): Promise<void> {
  logger.info('AuthService: Signing out');

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.warn('AuthService: Sign out error', { errorMessage: error.message });
      throw normalizeAuthError(error);
    }

    logger.info('AuthService: Sign out successful');
  } catch (error) {
    if ((error as AuthError).code) {
      throw error;
    }
    throw normalizeAuthError(error);
  }
}

/**
 * Envia email de recuperação de senha
 */
export async function resetPassword(email: string): Promise<void> {
  logger.info('AuthService: Requesting password reset', { email });

  if (!validateEmail(email)) {
    throw {
      code: 'invalid_email',
      message: AUTH_ERROR_MESSAGES.invalid_email,
    } as AuthError;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      // TODO: Configurar redirect URL para deep link quando implementar
      // redirectTo: 'gapp://reset-password',
    });

    if (error) {
      logger.warn('AuthService: Password reset failed', { 
        email, 
        errorMessage: error.message,
      });
      throw normalizeAuthError(error);
    }

    // Nota: Por segurança, sempre retornamos sucesso mesmo se o email não existir
    logger.info('AuthService: Password reset email sent', { email });
  } catch (error) {
    if ((error as AuthError).code) {
      throw error;
    }
    throw normalizeAuthError(error);
  }
}

/**
 * Obtém a sessão atual
 */
export async function getSession() {
  logger.debug('AuthService: Getting current session');

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.warn('AuthService: Get session error', { errorMessage: error.message });
      throw normalizeAuthError(error);
    }

    return data.session;
  } catch (error) {
    if ((error as AuthError).code) {
      throw error;
    }
    throw normalizeAuthError(error);
  }
}

/**
 * Obtém o usuário atual
 */
export async function getUser() {
  logger.debug('AuthService: Getting current user');

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      logger.warn('AuthService: Get user error', { errorMessage: error.message });
      return null;
    }

    return data.user;
  } catch (error) {
    logger.error('AuthService: Get user exception', { error });
    return null;
  }
}

