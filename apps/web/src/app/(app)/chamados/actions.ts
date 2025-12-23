'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// Types
// ============================================

export interface HubTicketFilters {
  search?: string
  department_id?: string
  status?: string
  priority?: string
  unit_id?: string
  page?: number
  limit?: number
}

export interface HubTicket {
  id: string
  ticket_number: number
  title: string
  status: string
  priority: string | null
  created_at: string
  department_id: string
  department_name: string
  unit_id: string | null
  unit_name: string | null
  unit_code: string | null
  assigned_to_id: string | null
  assigned_to_name: string | null
}

export interface HubStats {
  awaiting_triage: number
  in_progress: number
  resolved: number
  total: number
}

export interface Department {
  id: string
  name: string
}

export interface Unit {
  id: string
  name: string
  code: string
}

// ============================================
// Query Functions
// ============================================

/**
 * Lista chamados de todos os departamentos com filtros
 * Usa a view tickets_with_details para performance otimizada
 */
export async function getHubTickets(filters?: HubTicketFilters) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('tickets_with_details')
    .select('id, ticket_number, title, status, priority, created_at, department_id, department_name, unit_id, unit_name, unit_code, assigned_to_id, assigned_to_name', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (filters?.search) {
    const searchTerm = filters.search.trim()
    const ticketNumber = parseInt(searchTerm.replace('#', ''))
    
    if (!isNaN(ticketNumber)) {
      query = query.or(`title.ilike.%${searchTerm}%,ticket_number.eq.${ticketNumber}`)
    } else {
      query = query.ilike('title', `%${searchTerm}%`)
    }
  }
  
  if (filters?.department_id && filters.department_id !== 'all') {
    query = query.eq('department_id', filters.department_id)
  }
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }
  
  if (filters?.unit_id && filters.unit_id !== 'all') {
    query = query.eq('unit_id', filters.unit_id)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching hub tickets:', error)
    return { data: [], count: 0, page, limit }
  }

  return {
    data: (data || []) as HubTicket[],
    count: count || 0,
    page,
    limit,
  }
}

/**
 * Estatísticas gerais de todos os chamados
 */
export async function getHubStats(): Promise<HubStats> {
  const supabase = await createClient()
  
  const triageStatuses = [
    'awaiting_triage', 
    'awaiting_approval_encarregado', 
    'awaiting_approval_supervisor', 
    'awaiting_approval_gerente'
  ]
  
  const inProgressStatuses = [
    'in_progress', 
    'prioritized', 
    'quoting', 
    'approved',
    'executing',
    'waiting_parts'
  ]
  
  const resolvedStatuses = ['resolved', 'closed']

  const [triageResult, inProgressResult, resolvedResult, totalResult] = await Promise.all([
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', triageStatuses),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', inProgressStatuses),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', resolvedStatuses),
    supabase.from('tickets').select('*', { count: 'exact', head: true }),
  ])

  return {
    awaiting_triage: triageResult.count || 0,
    in_progress: inProgressResult.count || 0,
    resolved: resolvedResult.count || 0,
    total: totalResult.count || 0,
  }
}

/**
 * Lista departamentos que possuem chamados
 * Inclui apenas Compras, Manutenção e RH por padrão
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .in('name', ['Compras', 'Manutenção', 'RH'])
    .order('name')
  
  if (error) {
    console.error('Error fetching departments:', error)
    return []
  }
  
  return data || []
}

/**
 * Lista todas as unidades ativas
 */
export async function getUnits(): Promise<Unit[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching units:', error)
    return []
  }
  
  return data || []
}

// Note: Utility functions like getTicketDetailRoute and getNewTicketRoute
// are defined in the client components that use them, since 'use server' files
// can only export async functions.

