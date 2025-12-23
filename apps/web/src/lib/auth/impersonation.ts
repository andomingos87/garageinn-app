/**
 * Impersonation utilities for admin users.
 * Allows admins to "view as" another user for support/debugging purposes.
 */

const IMPERSONATION_KEY = "gapp_impersonation";
const ORIGINAL_SESSION_KEY = "gapp_original_session";

export interface ImpersonationState {
  isImpersonating: boolean;
  originalUserId?: string;
  impersonatedUserId?: string;
  impersonatedUserName?: string;
}

/**
 * Store the original admin session before impersonation.
 * This is stored in localStorage so we can restore it later.
 */
export function storeOriginalSession(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORIGINAL_SESSION_KEY, userId);
}

/**
 * Get the original admin user ID.
 */
export function getOriginalSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ORIGINAL_SESSION_KEY);
}

/**
 * Set the impersonation state.
 */
export function setImpersonationState(state: {
  userId: string;
  userName: string;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    IMPERSONATION_KEY,
    JSON.stringify({
      impersonatedUserId: state.userId,
      impersonatedUserName: state.userName,
    })
  );
}

/**
 * Get current impersonation state.
 */
export function getImpersonationState(): ImpersonationState {
  if (typeof window === "undefined") {
    return { isImpersonating: false };
  }

  const originalUserId = localStorage.getItem(ORIGINAL_SESSION_KEY);
  const impersonationData = localStorage.getItem(IMPERSONATION_KEY);

  if (!originalUserId || !impersonationData) {
    return { isImpersonating: false };
  }

  try {
    const { impersonatedUserId, impersonatedUserName } = JSON.parse(impersonationData);
    return {
      isImpersonating: true,
      originalUserId,
      impersonatedUserId,
      impersonatedUserName,
    };
  } catch {
    return { isImpersonating: false };
  }
}

/**
 * Clear impersonation state.
 */
export function clearImpersonationState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(IMPERSONATION_KEY);
  localStorage.removeItem(ORIGINAL_SESSION_KEY);
}

/**
 * Check if currently impersonating.
 */
export function isImpersonating(): boolean {
  return getImpersonationState().isImpersonating;
}

