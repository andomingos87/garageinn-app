'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Unit, UnitWithStaffCount, UnitStatus, UnitStaffMember } from '@/lib/supabase/database.types'

// ============================================
// Types
// ============================================

export interface UnitsFilters {
  search?: string
  status?: UnitStatus | 'all'
  city?: string
  region?: string
}

export interface UnitsStats {
  total: number
  active: number
  inactive: number
  totalCapacity: number
}

// ============================================
// Query Functions
// ============================================

/**
 * Busca lista de unidades com filtros
 */
export async function getUnits(filters?: UnitsFilters): Promise<UnitWithStaffCount[]> {
  const supabase = await createClient()

  let query = supabase
    .from('units')
    .select('*')
    .order('name')

  // Filtro de busca
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
  }

  // Filtro de status
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Filtro de cidade
  if (filters?.city) {
    query = query.eq('city', filters.city)
  }

  // Filtro de região
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }

  const { data: units, error } = await query

  if (error) {
    console.error('Error fetching units:', error)
    throw new Error('Erro ao buscar unidades')
  }

  // Buscar contagem de staff para cada unidade
  const { data: staffCounts, error: staffError } = await supabase
    .from('user_units')
    .select('unit_id')

  if (staffError) {
    console.error('Error fetching staff counts:', staffError)
  }

  // Mapear contagens
  const countMap = new Map<string, number>()
  staffCounts?.forEach((item) => {
    const current = countMap.get(item.unit_id) || 0
    countMap.set(item.unit_id, current + 1)
  })

  return (units || []).map((unit) => ({
    ...unit,
    status: unit.status as UnitStatus,
    staff_count: countMap.get(unit.id) || 0,
  }))
}

/**
 * Busca estatísticas de unidades
 */
export async function getUnitsStats(): Promise<UnitsStats> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('status, capacity')

  if (error) {
    console.error('Error fetching units stats:', error)
    return { total: 0, active: 0, inactive: 0, totalCapacity: 0 }
  }

  const stats = (data || []).reduce(
    (acc, unit) => {
      acc.total++
      if (unit.status === 'active') acc.active++
      else if (unit.status === 'inactive') acc.inactive++
      acc.totalCapacity += unit.capacity || 0
      return acc
    },
    { total: 0, active: 0, inactive: 0, totalCapacity: 0 }
  )

  return stats
}

/**
 * Busca lista de cidades únicas
 */
export async function getCities(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('city')
    .not('city', 'is', null)
    .order('city')

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  const cities = [...new Set(data?.map(u => u.city).filter((c): c is string => c !== null))]
  return cities
}

/**
 * Busca lista de regiões únicas
 */
export async function getRegions(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('region')
    .not('region', 'is', null)
    .order('region')

  if (error) {
    console.error('Error fetching regions:', error)
    return []
  }

  const regions = [...new Set(data?.map(u => u.region).filter((r): r is string => r !== null))]
  return regions
}

/**
 * Busca uma unidade por ID
 */
export async function getUnitById(unitId: string): Promise<Unit | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', unitId)
    .single()

  if (error) {
    console.error('Error fetching unit:', error)
    return null
  }

  return {
    ...data,
    status: data.status as UnitStatus,
  }
}

/**
 * Busca equipe vinculada a uma unidade
 */
export async function getUnitStaff(unitId: string): Promise<UnitStaffMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_units')
    .select(`
      id,
      is_coverage,
      user:profiles (
        id,
        full_name,
        email,
        avatar_url,
        user_roles (
          role:roles (
            name,
            department:departments (name)
          )
        )
      )
    `)
    .eq('unit_id', unitId)

  if (error) {
    console.error('Error fetching unit staff:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => {
    const firstRole = item.user?.user_roles?.[0]?.role
    return {
      user_id: item.user?.id || '',
      user_name: item.user?.full_name || '',
      user_email: item.user?.email || '',
      user_avatar: item.user?.avatar_url,
      is_coverage: item.is_coverage ?? false,
      role_name: firstRole?.name || null,
      department_name: firstRole?.department?.name || null,
    }
  })
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Atualiza o status de uma unidade
 */
export async function updateUnitStatus(unitId: string, status: UnitStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('units')
    .update({ status })
    .eq('id', unitId)

  if (error) {
    console.error('Error updating unit status:', error)
    return { error: error.message }
  }

  revalidatePath('/unidades')
  revalidatePath(`/unidades/${unitId}`)
  return { success: true }
}

/**
 * Cria uma nova unidade
 */
export async function createUnit(data: {
  name: string
  code: string
  address: string
  city?: string | null
  state?: string | null
  zip_code?: string | null
  phone?: string | null
  email?: string | null
  capacity?: number | null
  cnpj?: string | null
  neighborhood?: string | null
  region?: string | null
  administrator?: string | null
}) {
  const supabase = await createClient()

  // Verificar código único
  const { data: existing } = await supabase
    .from('units')
    .select('id')
    .eq('code', data.code)
    .maybeSingle()

  if (existing) {
    return { error: 'Já existe uma unidade com este código' }
  }

  const { data: unit, error } = await supabase
    .from('units')
    .insert({
      name: data.name,
      code: data.code,
      address: data.address,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      phone: data.phone || null,
      email: data.email || null,
      capacity: data.capacity || null,
      cnpj: data.cnpj || null,
      neighborhood: data.neighborhood || null,
      region: data.region || null,
      administrator: data.administrator || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating unit:', error)
    return { error: error.message }
  }

  revalidatePath('/unidades')
  return { success: true, unitId: unit.id }
}

/**
 * Atualiza uma unidade existente
 */
export async function updateUnit(
  unitId: string,
  data: {
    name?: string
    code?: string
    address?: string
    city?: string | null
    state?: string | null
    zip_code?: string | null
    phone?: string | null
    email?: string | null
    capacity?: number | null
    status?: UnitStatus
    cnpj?: string | null
    neighborhood?: string | null
    region?: string | null
    administrator?: string | null
  }
) {
  const supabase = await createClient()

  // Se o código estiver sendo alterado, verificar unicidade
  if (data.code) {
    const { data: existing } = await supabase
      .from('units')
      .select('id')
      .eq('code', data.code)
      .neq('id', unitId)
      .maybeSingle()

    if (existing) {
      return { error: 'Já existe outra unidade com este código' }
    }
  }

  const { error } = await supabase
    .from('units')
    .update(data)
    .eq('id', unitId)

  if (error) {
    console.error('Error updating unit:', error)
    return { error: error.message }
  }

  revalidatePath('/unidades')
  revalidatePath(`/unidades/${unitId}`)
  return { success: true }
}

/**
 * Gera o próximo código de unidade
 */
export async function generateUnitCode(): Promise<string> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('units')
    .select('code')
    .like('code', 'UN%')
    .order('code', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.code) {
    return 'UN001'
  }

  const lastNumber = parseInt(data.code.replace('UN', ''), 10)
  return `UN${String(lastNumber + 1).padStart(3, '0')}`
}

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

// ============================================
// Unit Metrics
// ============================================

export interface UnitMetrics {
  // Chamados
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  
  // Checklists
  totalChecklists: number
  completedChecklists: number
  checklistsThisMonth: number
  
  // Conformidade
  nonConformityRate: number // % de checklists com não-conformidades
}

/**
 * Busca métricas operacionais de uma unidade (chamados e checklists)
 */
export async function getUnitMetrics(unitId: string): Promise<UnitMetrics> {
  const supabase = await createClient()
  
  // Buscar chamados da unidade
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('unit_id', unitId)
  
  // Buscar execuções de checklist da unidade
  const { data: checklists } = await supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities, completed_at')
    .eq('unit_id', unitId)
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const openStatuses = ['awaiting_triage', 'in_triage', 'awaiting_approval', 'in_progress', 'awaiting_quotation']
  
  return {
    totalTickets: tickets?.length || 0,
    openTickets: tickets?.filter(t => openStatuses.includes(t.status)).length || 0,
    resolvedTickets: tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0,
    
    totalChecklists: checklists?.length || 0,
    completedChecklists: checklists?.filter(c => c.status === 'completed').length || 0,
    checklistsThisMonth: checklists?.filter(c => 
      c.completed_at && new Date(c.completed_at) >= firstDayOfMonth
    ).length || 0,
    
    nonConformityRate: checklists?.length 
      ? Math.round((checklists.filter(c => c.has_non_conformities).length / checklists.length) * 100)
      : 0,
  }
}

// ============================================
// Unit History (Audit Log)
// ============================================

export interface UnitHistoryEntry {
  id: string
  action: string
  user_name: string | null
  user_avatar: string | null
  changes: {
    field: string
    old_value: string | null
    new_value: string | null
  }[]
  created_at: string
}

/**
 * Busca histórico de alterações de uma unidade (audit log)
 */
export async function getUnitHistory(unitId: string): Promise<UnitHistoryEntry[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      old_data,
      new_data,
      created_at,
      user:profiles!audit_logs_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('entity_type', 'unit')
    .eq('entity_id', unitId)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Error fetching unit history:', error)
    return []
  }
  
  // Map field names to friendly labels
  const fieldLabels: Record<string, string> = {
    name: 'Nome',
    code: 'Código',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    zip_code: 'CEP',
    phone: 'Telefone',
    email: 'Email',
    capacity: 'Capacidade',
    status: 'Status',
    cnpj: 'CNPJ',
    neighborhood: 'Bairro',
    region: 'Região',
    administrator: 'Administradora',
    supervisor_name: 'Supervisor',
  }
  
  // Fields to ignore in change detection (internal/system fields)
  const ignoredFields = ['id', 'created_at', 'updated_at']
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((entry: any) => {
    const changes: UnitHistoryEntry['changes'] = []
    
    if (entry.action === 'unit.update' && entry.old_data && entry.new_data) {
      // Detect changed fields
      for (const key of Object.keys(entry.new_data)) {
        if (ignoredFields.includes(key)) continue
        
        const oldVal = entry.old_data[key]
        const newVal = entry.new_data[key]
        
        // Compare values (handle null/undefined)
        if (oldVal !== newVal) {
          changes.push({
            field: fieldLabels[key] || key,
            old_value: oldVal?.toString() || null,
            new_value: newVal?.toString() || null,
          })
        }
      }
    } else if (entry.action === 'unit.insert') {
      changes.push({ field: 'Criação', old_value: null, new_value: 'Unidade criada' })
    } else if (entry.action === 'unit.delete') {
      changes.push({ field: 'Exclusão', old_value: null, new_value: 'Unidade excluída' })
    }
    
    return {
      id: entry.id,
      action: entry.action,
      user_name: entry.user?.full_name || 'Sistema',
      user_avatar: entry.user?.avatar_url || null,
      changes,
      created_at: entry.created_at,
    }
  })
}

