"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getImpersonationState,
  clearImpersonationState,
  ImpersonationState,
} from "@/lib/auth/impersonation";

/**
 * Hook to manage impersonation state in client components.
 */
export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
  });

  useEffect(() => {
    setState(getImpersonationState());
  }, []);

  const exitImpersonation = useCallback(async () => {
    clearImpersonationState();
    // Reload to restore original session
    window.location.href = "/";
  }, []);

  return {
    ...state,
    exitImpersonation,
  };
}

