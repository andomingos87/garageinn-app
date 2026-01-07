'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// Types
// ============================================

export interface UserUnit {
  id: string
  name: string
  code: string
}

// ============================================
// Query Functions
// ============================================

/**
 * Obtém unidades acessíveis ao usuário atual
 *
 * Regras de acesso (implementadas na RPC get_user_accessible_units):
 * - Admin/Desenvolvedor/Diretor: todas as unidades
 * - Gerente: todas as unidades
 * - Supervisor: unidades vinculadas (múltiplas, is_coverage = true)
 * - Manobrista/Encarregado: unidade vinculada (única)
 */
export async function getUserUnits(): Promise<UserUnit[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Usar RPC que centraliza a lógica de acesso por role
  const { data, error } = await supabase.rpc('get_user_accessible_units')

  if (error) {
    console.error('Error fetching accessible units:', error)
    return []
  }

  return data || []
}

/**
 * Verifica se o usuário tem unidade fixa (Manobrista/Encarregado)
 * Retorna a unidade se única e role for de unidade fixa, null caso contrário
 */
export async function getUserFixedUnit(): Promise<UserUnit | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verificar se tem role de unidade fixa (Manobrista ou Encarregado)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasFixedUnitRole = userRoles?.some((ur: any) =>
    ['Manobrista', 'Encarregado'].includes(ur.role?.name)
  )

  if (!hasFixedUnitRole) return null

  // Buscar unidade única (não coverage)
  const { data: units } = await supabase
    .from('user_units')
    .select('unit:units(id, name, code)')
    .eq('user_id', user.id)
    .eq('is_coverage', false)
    .limit(1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (units?.[0] as any)?.unit || null
}
