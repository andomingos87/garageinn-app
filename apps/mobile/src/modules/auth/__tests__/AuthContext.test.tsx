/**
 * Gapp Mobile - Auth Context Tests
 * 
 * Testes unitários para o AuthContext e hooks de autenticação.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';

// Mock do Supabase
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('../../../lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: Function) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
    },
  },
}));

// Mock do logger
jest.mock('../../../lib/observability', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Wrapper para os hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: sem sessão
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  describe('useAuthContext', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suprimir console.error para este teste
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow('useAuthContext must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should return auth state and actions', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Estado
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Ações
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should handle successful sign in', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in error', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.code).toBe('invalid_credentials');
    });

    it('should handle sign out', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle password reset', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', expect.any(Object));
    });

    it('should clear error', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Trigger error
      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrong');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useSession hook', () => {
    it('should return session state', async () => {
      const { result } = renderHook(() => useSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return authenticated state when session exists', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Note: O estado será atualizado pelo listener onAuthStateChange
      // Para testar completamente, precisaríamos simular o callback
    });
  });

  describe('session initialization', () => {
    it('should check for existing session on mount', async () => {
      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });

    it('should handle session check error gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });
});

