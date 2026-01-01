/**
 * Gapp Mobile - Supabase Client
 * 
 * Cliente Supabase configurado para React Native/Expo.
 * TODO: Adicionar AsyncStorage para persistência de sessão quando implementar auth.
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, isSupabaseConfigured } from './config';

// Placeholder para tipos do banco - será gerado via `mcp_supabase_generate_typescript_types`
// import type { Database } from './database.types';

// Cria o cliente Supabase
export const supabase = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co',
  supabaseConfig.anonKey || 'placeholder-key',
  {
    auth: {
      // TODO: Configurar AsyncStorage para persistência
      // storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Desabilitar para React Native
    },
  }
);

// Exporta helper de verificação
export { isSupabaseConfigured };

