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

/**
 * Obtém a rota de detalhes baseada no departamento
 */
export function getTicketDetailRoute(departmentName: string, ticketId: string): string {
  const routeMap: Record<string, string> = {
    'Compras': `/chamados/compras/${ticketId}`,
    'Manutenção': `/chamados/manutencao/${ticketId}`,
    'RH': `/chamados/rh/${ticketId}`,
  }
  
  return routeMap[departmentName] || `/chamados/${ticketId}`
}

/**
 * Obtém a rota de criação baseada no departamento
 */
export function getNewTicketRoute(departmentName: string): string {
  const routeMap: Record<string, string> = {
    'Compras': '/chamados/compras/novo',
    'Manutenção': '/chamados/manutencao/novo',
    'RH': '/chamados/rh/novo',
  }
  
  return routeMap[departmentName] || '/chamados/novo'
}

// ============================================
// Constants
// ============================================

/**
 * Mapeamento de status para labels e variantes
 */
export const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  // Triagem/Aprovação
  awaiting_triage: { label: 'Aguardando Triagem', variant: 'outline' },
  awaiting_approval_encarregado: { label: 'Aguardando Encarregado', variant: 'outline' },
  awaiting_approval_supervisor: { label: 'Aguardando Supervisor', variant: 'outline' },
  awaiting_approval_gerente: { label: 'Aguardando Gerente', variant: 'outline' },
  
  // Em Progresso
  prioritized: { label: 'Priorizado', variant: 'default' },
  in_progress: { label: 'Em Andamento', variant: 'default' },
  quoting: { label: 'Em Cotação', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  executing: { label: 'Em Execução', variant: 'default' },
  waiting_parts: { label: 'Aguardando Peças', variant: 'secondary' },
  
  // Finalizados
  resolved: { label: 'Resolvido', variant: 'default' },
  closed: { label: 'Encerrado', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
  denied: { label: 'Negado', variant: 'destructive' },
}

/**
 * Mapeamento de prioridades para labels e variantes
 */
export const PRIORITY_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Baixa', variant: 'secondary' },
  medium: { label: 'Média', variant: 'default' },
  high: { label: 'Alta', variant: 'destructive' },
  urgent: { label: 'Urgente', variant: 'destructive' },
}

/**
 * Lista de status para filtros
 */
export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'awaiting_triage', label: 'Aguardando Triagem' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'quoting', label: 'Em Cotação' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'executing', label: 'Em Execução' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Encerrado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'denied', label: 'Negado' },
]

/**
 * Lista de prioridades para filtros
 */
export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Todas as Prioridades' },
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

