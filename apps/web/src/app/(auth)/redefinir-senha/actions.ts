"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Server action to update user password.
 */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!password || !confirmPassword) {
    return { error: "Todos os campos são obrigatórios" };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem" };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    if (error.message.includes("should be different")) {
      return { error: "A nova senha deve ser diferente da anterior" };
    }
    return { error: error.message };
  }

  redirect("/login?message=password_updated");
}

