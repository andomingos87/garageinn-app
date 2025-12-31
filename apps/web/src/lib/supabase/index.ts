// Re-export Supabase clients for convenience
export { createClient as createClientComponentClient } from "./client";
export { createClient as createServerComponentClient } from "./server";
export { updateSession } from "./middleware";
export type * from "./database.types";

// Re-export custom types and utilities
export * from "./custom-types";
