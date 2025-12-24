import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root page handler
 * 
 * This file exists to ensure Next.js recognizes the "/" route.
 * It redirects to the appropriate destination based on auth status.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Authenticated users go to dashboard (handled by (app)/page.tsx layout)
    redirect("/dashboard");
  } else {
    // Unauthenticated users go to login
    redirect("/login");
  }
}

