"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string | null;
}

/**
 * Hook to get the current user's profile data.
 * Combines auth user with profile table data.
 */
export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        // Fallback to auth user data
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || null,
          status: null,
        });
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  return {
    profile,
    isLoading: authLoading || isLoading,
    user,
  };
}

