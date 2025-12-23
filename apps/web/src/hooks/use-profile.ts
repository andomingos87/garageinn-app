"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";
import { useEffect, useState } from "react";
import type { UserRoleInfo } from "@/lib/supabase/database.types";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'pending';
  roles: UserRoleInfo[];
}

/**
 * Hook to get the current user's profile data with roles.
 * Combines auth user with profile table data and user_roles.
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
        .select(`
          id, 
          full_name, 
          email,
          phone,
          cpf, 
          avatar_url, 
          status,
          user_roles (
            role:roles (
              id,
              name,
              is_global,
              department:departments (
                id,
                name
              )
            )
          )
        `)
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        // Fallback to auth user data
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
          phone: null,
          cpf: null,
          avatar_url: user.user_metadata?.avatar_url || null,
          status: 'pending',
          roles: [],
        });
      } else {
        // Transform roles data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roles: UserRoleInfo[] = (data.user_roles || [])
          .filter((ur: any) => ur.role !== null)
          .map((ur: any) => ({
            role_id: ur.role.id,
            role_name: ur.role.name,
            department_id: ur.role.department?.id ?? null,
            department_name: ur.role.department?.name ?? null,
            is_global: ur.role.is_global ?? false,
          }));

        setProfile({
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
          avatar_url: data.avatar_url,
          status: (data.status || 'pending') as Profile['status'],
          roles,
        });
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
