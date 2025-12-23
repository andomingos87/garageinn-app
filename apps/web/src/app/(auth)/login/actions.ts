"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Server action to sign in with email and password.
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase errors to user-friendly messages
    if (error.message === "Invalid login credentials") {
      return { error: "Email ou senha incorretos" };
    }
    if (error.message === "Email not confirmed") {
      return { error: "Por favor, confirme seu email antes de fazer login" };
    }
    return { error: error.message };
  }

  redirect("/");
}

/**
 * Server action to sign out.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

