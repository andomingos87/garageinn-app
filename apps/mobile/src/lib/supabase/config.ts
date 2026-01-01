/**
 * Gapp Mobile - Supabase Configuration
 * 
 * Configuração segura usando variáveis de ambiente do Expo.
 * As variáveis EXPO_PUBLIC_* são expostas no bundle do app.
 */

import Constants from 'expo-constants';

// Validação de variáveis de ambiente
function getEnvVar(key: string): string {
  const value = Constants.expoConfig?.extra?.[key] 
    || process.env[key];
  
  if (!value) {
    console.warn(`[Supabase] Missing environment variable: ${key}`);
    return '';
  }
  
  return value;
}

export const supabaseConfig = {
  url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
} as const;

// Verifica se a configuração está completa
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

