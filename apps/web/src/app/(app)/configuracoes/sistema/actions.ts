'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface SystemSetting {
  id: string
  key: string
  value: unknown
  description: string | null
  updated_at: string
  updated_by: string | null
}

export interface SystemSettingsMap {
  company_name: string
  company_logo: string | null
  timezone: string
  email_smtp_host: string | null
  email_smtp_port: number
  email_smtp_user: string | null
  email_smtp_from: string | null
  email_smtp_from_name: string
  notifications_email_enabled: boolean
  notifications_push_enabled: boolean
  upload_max_size_mb: number
  upload_allowed_types: string[]
}

// Configurações padrão
const DEFAULT_SETTINGS: SystemSettingsMap = {
  company_name: 'GarageInn',
  company_logo: null,
  timezone: 'America/Sao_Paulo',
  email_smtp_host: null,
  email_smtp_port: 587,
  email_smtp_user: null,
  email_smtp_from: null,
  email_smtp_from_name: 'GAPP Sistema',
  notifications_email_enabled: true,
  notifications_push_enabled: false,
  upload_max_size_mb: 10,
  upload_allowed_types: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

// ============================================
// Read Actions
// ============================================

/**
 * Busca todas as configurações do sistema
 */
export async function getSystemSettings(): Promise<SystemSettingsMap> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value')
    .order('key')

  if (error) {
    console.error('Error fetching system settings:', error)
    // Retorna valores padrão em caso de erro
    return DEFAULT_SETTINGS
  }

  // Monta o objeto de configurações a partir dos dados
  const settings = { ...DEFAULT_SETTINGS } as Record<string, unknown>

  for (const setting of data || []) {
    const key = setting.key
    if (key in DEFAULT_SETTINGS) {
      settings[key] = setting.value
    }
  }

  return settings as SystemSettingsMap
}

/**
 * Busca uma configuração específica
 */
export async function getSettingByKey<K extends keyof SystemSettingsMap>(
  key: K
): Promise<SystemSettingsMap[K]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    console.error(`Error fetching setting ${key}:`, error)
    return DEFAULT_SETTINGS[key]
  }

  return data.value as SystemSettingsMap[K]
}

/**
 * Busca configurações brutas para exibição
 */
export async function getSystemSettingsRaw(): Promise<SystemSetting[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('key')

  if (error) {
    console.error('Error fetching system settings:', error)
    return []
  }

  return data || []
}

// ============================================
// Update Actions
// ============================================

/**
 * Atualiza uma configuração específica
 */
export async function updateSetting<K extends keyof SystemSettingsMap>(
  key: K,
  value: SystemSettingsMap[K]
) {
  const supabase = await createClient()

  // Buscar o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('system_settings')
    .update({
      value,
      updated_by: user?.id || null,
    })
    .eq('key', key)

  if (error) {
    console.error(`Error updating setting ${key}:`, error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/sistema')
  return { success: true }
}

/**
 * Atualiza múltiplas configurações de uma vez
 */
export async function updateSettings(
  settings: Partial<SystemSettingsMap>
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // Buscar o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Atualiza cada configuração
  for (const [key, value] of Object.entries(settings)) {
    const { error } = await supabase
      .from('system_settings')
      .update({
        value,
        updated_by: user?.id || null,
      })
      .eq('key', key)

    if (error) {
      console.error(`Error updating setting ${key}:`, error)
      return { error: `Erro ao atualizar ${key}: ${error.message}` }
    }
  }

  revalidatePath('/configuracoes/sistema')
  return { success: true }
}

// ============================================
// Section-specific Update Actions
// ============================================

/**
 * Atualiza configurações gerais
 */
export async function updateGeneralSettings(data: {
  company_name: string
  timezone: string
}) {
  return updateSettings({
    company_name: data.company_name,
    timezone: data.timezone,
  })
}

/**
 * Atualiza configurações de email
 */
export async function updateEmailSettings(data: {
  email_smtp_host: string | null
  email_smtp_port: number
  email_smtp_user: string | null
  email_smtp_from: string | null
  email_smtp_from_name: string
}) {
  return updateSettings({
    email_smtp_host: data.email_smtp_host,
    email_smtp_port: data.email_smtp_port,
    email_smtp_user: data.email_smtp_user,
    email_smtp_from: data.email_smtp_from,
    email_smtp_from_name: data.email_smtp_from_name,
  })
}

/**
 * Atualiza configurações de notificação
 */
export async function updateNotificationSettings(data: {
  notifications_email_enabled: boolean
  notifications_push_enabled: boolean
}) {
  return updateSettings({
    notifications_email_enabled: data.notifications_email_enabled,
    notifications_push_enabled: data.notifications_push_enabled,
  })
}

/**
 * Atualiza configurações de upload
 */
export async function updateUploadSettings(data: {
  upload_max_size_mb: number
  upload_allowed_types: string[]
}) {
  return updateSettings({
    upload_max_size_mb: data.upload_max_size_mb,
    upload_allowed_types: data.upload_allowed_types,
  })
}

// ============================================
// Auth Check
// ============================================

/**
 * Verifica se o usuário atual é admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data === true
}


