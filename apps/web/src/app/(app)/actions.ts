"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Server action to sign out the current user.
 * Invalidates the session and redirects to login page.
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erro ao fazer logout:", error.message);
    // Even with error, redirect to login
  }

  // Clear cache for all protected routes
  revalidatePath("/", "layout");

  redirect("/login");
}

