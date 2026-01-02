/**
 * Gapp Mobile - useAuth Hook
 * 
 * Hook principal para operações de autenticação.
 * Fornece acesso ao estado de auth e ações.
 */

import { useAuthContext } from '../context/AuthContext';

/**
 * Hook para autenticação
 * 
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { signIn, loading, error } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     try {
 *       await signIn(email, password);
 *     } catch (e) {
 *       // Erro já está no estado
 *     }
 *   };
 * }
 * ```
 */
export function useAuth() {
  const {
    user,
    session,
    loading,
    error,
    isInitialized,
    signIn,
    signOut,
    resetPassword,
    clearError,
  } = useAuthContext();

  return {
    // Estado
    user,
    session,
    loading,
    error,
    isInitialized,
    isAuthenticated: !!session,

    // Ações
    signIn,
    signOut,
    resetPassword,
    clearError,
  };
}

