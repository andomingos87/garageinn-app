"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getImpersonationState,
  clearImpersonationState,
  ImpersonationState,
} from "@/lib/auth/impersonation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to manage impersonation state in client components.
 * Validates impersonation state against the current user session
 * to prevent orphan states after logout/login.
 */
export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
  });
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load before validating
    if (isLoading) return;

    const validateState = () => {
      const savedState = getImpersonationState();

      // If no saved state, return empty
      if (!savedState.isImpersonating) {
        setState(savedState);
        return;
      }

      // If no user is logged in yet, keep current state (don't clear prematurely)
      // The state will be validated once the user session loads
      if (!user) {
        setState(savedState);
        return;
      }

      // Validate if current user matches saved state
      const isCurrentlyImpersonating = user.id === savedState.impersonatedUserId;
      const isOriginalAdmin = user.id === savedState.originalUserId;

      // If current user doesn't match any of the saved IDs, it's an orphan state
      if (!isCurrentlyImpersonating && !isOriginalAdmin) {
        clearImpersonationState();
        setState({ isImpersonating: false });
        return;
      }

      // Valid state: update with correct flag
      setState({
        ...savedState,
        isImpersonating: isCurrentlyImpersonating,
      });
    };

    validateState();
  }, [user, isLoading]);

  const exitImpersonation = useCallback(async () => {
    clearImpersonationState();
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  return {
    ...state,
    exitImpersonation,
  };
}

