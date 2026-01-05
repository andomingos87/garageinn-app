"use client";

import { useEffect } from "react";

/**
 * Component that detects auth tokens in URL hash and redirects to callback.
 *
 * This handles the case where magic links redirect directly to a page
 * (like /dashboard) instead of /auth/callback. The tokens in the hash
 * need to be processed by the callback page to establish the session.
 */
export function HashHandler() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const hash = window.location.hash;

    // Check if hash contains auth tokens
    if (hash && hash.includes("access_token=")) {
      // Get current path (without hash)
      const currentPath = window.location.pathname;

      // Don't redirect if already on callback page
      if (currentPath === "/auth/callback") return;

      // Redirect to callback with the hash, preserving the destination
      const callbackUrl = `/auth/callback?next=${encodeURIComponent(currentPath)}${hash}`;
      window.location.href = callbackUrl;
    }
  }, []);

  return null;
}
