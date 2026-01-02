/**
 * Gapp Mobile - Supabase Client
 * 
 * Cliente Supabase configurado para React Native/Expo.
 * Usa AsyncStorage para persistência de sessão de autenticação.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseConfig, isSupabaseConfigured } from './config';

// Placeholder para tipos do banco - será gerado via `mcp_supabase_generate_typescript_types`
// import type { Database } from './database.types';

// Cria o cliente Supabase com AsyncStorage para persistência
export const supabase = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co',
  supabaseConfig.anonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Desabilitar para React Native
    },
  }
);

// Exporta helper de verificação
export { isSupabaseConfigured };

