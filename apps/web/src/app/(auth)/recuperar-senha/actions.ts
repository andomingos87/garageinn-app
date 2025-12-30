"use server";

import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Server action to request password reset.
 * Sends a recovery email to the user.
 * 
 * IMPORTANTE: O Supabase redireciona com tokens no hash fragment (#access_token=...)
 * que não são acessíveis pelo servidor. Por isso, redirecionamos diretamente para
 * /redefinir-senha onde o componente cliente (NewPasswordForm) processa o hash.
 */
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email é obrigatório" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Redireciona diretamente para a página de redefinição
    // O NewPasswordForm processa o hash fragment no cliente
    redirectTo: `${siteUrl}/redefinir-senha`,
  });

  if (error) {
    // Don't reveal if email exists or not for security
    console.error("Password reset error:", error.message);
  }

  // Always return success to prevent email enumeration
  return { success: true };
}

