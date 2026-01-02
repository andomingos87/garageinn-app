/**
 * Gapp Mobile - Auth Types
 * 
 * Tipos TypeScript para o módulo de autenticação.
 */

import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

/**
 * Códigos de erro de autenticação conhecidos
 */
export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'invalid_email'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'too_many_requests'
  | 'network_error'
  | 'session_expired'
  | 'unknown';

/**
 * Erro de autenticação normalizado
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  originalError?: SupabaseAuthError | Error;
}

/**
 * Estado do contexto de autenticação
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  isInitialized: boolean;
}

/**
 * Ações disponíveis no contexto de autenticação
 */
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Tipo completo do contexto de autenticação
 */
export type AuthContextType = AuthState & AuthActions;

/**
 * Props do AuthProvider
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Mensagens de erro em PT-BR
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'E-mail ou senha incorretos',
  invalid_email: 'Formato de e-mail inválido',
  user_not_found: 'Usuário não encontrado',
  email_not_confirmed: 'E-mail não confirmado. Verifique sua caixa de entrada',
  too_many_requests: 'Muitas tentativas. Aguarde alguns minutos',
  network_error: 'Sem conexão com a internet. Verifique sua conexão',
  session_expired: 'Sua sessão expirou. Faça login novamente',
  unknown: 'Ocorreu um erro. Tente novamente',
};

