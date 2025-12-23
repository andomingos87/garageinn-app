/**
 * Auth utilities exports
 */
export {
  storeOriginalSession,
  getOriginalSession,
  setImpersonationState,
  getImpersonationState,
  clearImpersonationState,
  isImpersonating,
  type ImpersonationState,
} from "./impersonation";

/**
 * Helper to check if user has admin role
 */
export async function checkIsAdmin(supabase: {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string | boolean) => {
          eq: (col: string, val: string | boolean) => {
            maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
    };
  };
}, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles!inner(name, is_global)")
    .eq("user_id", userId)
    .eq("roles.name", "Administrador")
    .eq("roles.is_global", true)
    .maybeSingle();

  return !error && !!data;
}

