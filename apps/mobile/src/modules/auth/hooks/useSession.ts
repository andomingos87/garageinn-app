/**
 * Gapp Mobile - useSession Hook
 * 
 * Hook para verificar estado da sessão.
 */

import { useAuthContext } from '../context/AuthContext';

/**
 * Hook para verificar sessão
 * 
 * @example
 * ```tsx
 * function ProtectedScreen() {
 *   const { isAuthenticated, isLoading } = useSession();
 *   
 *   if (isLoading) return <Loading />;
 *   if (!isAuthenticated) return <Redirect to="Login" />;
 *   
 *   return <Content />;
 * }
 * ```
 */
export function useSession() {
  const { session, user, loading, isInitialized } = useAuthContext();

  return {
    session,
    user,
    isAuthenticated: !!session,
    isLoading: loading || !isInitialized,
    isInitialized,
  };
}

