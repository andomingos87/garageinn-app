"use server";

import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Server action to request password reset.
 * Sends a magic link to the user's email.
 */
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email é obrigatório" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Go through callback to exchange PKCE code for session first
    redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`,
  });

  if (error) {
    // Don't reveal if email exists or not for security
    console.error("Password reset error:", error.message);
  }

  // Always return success to prevent email enumeration
  return { success: true };
}

