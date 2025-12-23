'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================
// Types
// ============================================

export interface TicketFilters {
  status?: string
  priority?: string
  category_id?: string
  unit_id?: string
  assigned_to?: string
  maintenance_type?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TicketStats {
  total: number
  awaitingTriage: number
  inProgress: number
  closed: number
}

export interface MaintenanceCategory {
  id: string
  name: string
  department_id: string
  status: string
}

export interface UserUnit {
  id: string
  name: string
  code: string
}

// ============================================
// Query Functions
// ============================================

/**
 * Busca departamento de Manutenção
 */
async function getManutencaoDepartment() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (error) {
    console.error('Error fetching Manutenção department:', error)
    return null
  }
  
  return data
}

/**
 * Lista categorias/assuntos de Manutenção
 */
export async function getMaintenanceCategories(): Promise<MaintenanceCategory[]> {
  const supabase = await createClient()
  
  const manutencaoDept = await getManutencaoDepartment()
  if (!manutencaoDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', manutencaoDept.id)
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching maintenance categories:', error)
    return []
  }
  
  return data || []
}

/**
 * Obtém unidades do usuário
 */
export async function getUserUnits(): Promise<UserUnit[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Verificar se é admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  
  if (isAdmin) {
    const { data } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('status', 'active')
      .order('name')
    return data || []
  }
  
  // Senão, apenas unidades vinculadas
  const { data } = await supabase
    .from('user_units')
    .select('unit:units(id, name, code)')
    .eq('user_id', user.id)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((d: any) => d.unit).filter(Boolean) || []
}

/**
 * Lista chamados de Manutenção com filtros
 */
export async function getMaintenanceTickets(filters?: TicketFilters) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  // Use the maintenance-specific view that includes maintenance details
  let query = supabase
    .from('tickets_maintenance_with_details')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }
  
  if (filters?.category_id && filters.category_id !== 'all') {
    query = query.eq('category_id', filters.category_id)
  }
  
  if (filters?.unit_id && filters.unit_id !== 'all') {
    query = query.eq('unit_id', filters.unit_id)
  }
  
  if (filters?.assigned_to && filters.assigned_to !== 'all') {
    query = query.eq('assigned_to_id', filters.assigned_to)
  }
  
  if (filters?.maintenance_type && filters.maintenance_type !== 'all') {
    query = query.eq('maintenance_type', filters.maintenance_type)
  }
  
  if (filters?.search) {
    const searchTerm = filters.search.trim()
    const ticketNumber = parseInt(searchTerm.replace('#', ''))
    
    if (!isNaN(ticketNumber)) {
      query = query.or(`title.ilike.%${searchTerm}%,ticket_number.eq.${ticketNumber}`)
    } else {
      query = query.ilike('title', `%${searchTerm}%`)
    }
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', `${filters.startDate}T00:00:00`)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', `${filters.endDate}T23:59:59`)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching maintenance tickets:', error)
    return { data: [], count: 0, page, limit }
  }
  
  return { data: data || [], count: count || 0, page, limit }
}

/**
 * Estatísticas de Chamados de Manutenção
 */
export async function getMaintenanceStats(): Promise<TicketStats> {
  const supabase = await createClient()
  
  const manutencaoDept = await getManutencaoDepartment()
  if (!manutencaoDept) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', manutencaoDept.id)
  
  if (!data) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  }
  
  const closedStatuses = ['closed', 'cancelled', 'denied']
  const triageStatuses = ['awaiting_triage', 'awaiting_approval_encarregado', 'awaiting_approval_supervisor', 'awaiting_approval_gerente']
  
  return {
    total: data.length,
    awaitingTriage: data.filter(t => triageStatuses.includes(t.status)).length,
    inProgress: data.filter(t => !closedStatuses.includes(t.status) && !triageStatuses.includes(t.status)).length,
    closed: data.filter(t => closedStatuses.includes(t.status)).length,
  }
}

/**
 * Busca um chamado de Manutenção por ID
 */
export async function getMaintenanceTicketById(ticketId: string) {
  const supabase = await createClient()
  
  // Use the maintenance-specific view that includes maintenance details
  const { data, error } = await supabase
    .from('tickets_maintenance_with_details')
    .select('*')
    .eq('id', ticketId)
    .single()
  
  if (error) {
    console.error('Error fetching maintenance ticket:', error)
    return null
  }
  
  return data
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um chamado de Manutenção
 */
export async function createMaintenanceTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Obter departamento de Manutenção
  const manutencaoDept = await getManutencaoDepartment()
  if (!manutencaoDept) {
    return { error: 'Departamento de Manutenção não encontrado' }
  }
  
  // Extrair dados do formulário
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string | null
  const unit_id = formData.get('unit_id') as string | null
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  const maintenance_type = formData.get('maintenance_type') as string | null
  const location_description = formData.get('location_description') as string | null
  const equipment_affected = formData.get('equipment_affected') as string | null
  
  // Validações
  if (!title || title.length < 5) {
    return { error: 'Título deve ter pelo menos 5 caracteres' }
  }
  if (!description || description.length < 10) {
    return { error: 'Descrição deve ter pelo menos 10 caracteres' }
  }
  if (!category_id) {
    return { error: 'Selecione um assunto para a manutenção' }
  }
  
  // Verificar se precisa de aprovação
  const { data: needsApproval } = await supabase.rpc('ticket_needs_approval', {
    p_created_by: user.id,
    p_department_id: manutencaoDept.id
  })
  
  const initialStatus = needsApproval 
    ? 'awaiting_approval_encarregado' 
    : 'awaiting_triage'
  
  // Criar ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      title,
      description,
      department_id: manutencaoDept.id,
      category_id: category_id && category_id !== '' ? category_id : null,
      unit_id: unit_id && unit_id !== '' ? unit_id : null,
      created_by: user.id,
      status: initialStatus,
      perceived_urgency: perceived_urgency && perceived_urgency !== '' ? perceived_urgency : null
    })
    .select()
    .single()
  
  if (ticketError) {
    console.error('Error creating maintenance ticket:', ticketError)
    return { error: ticketError.message }
  }
  
  // Criar detalhes de manutenção
  const { error: detailsError } = await supabase
    .from('ticket_maintenance_details')
    .insert({
      ticket_id: ticket.id,
      subject_id: category_id && category_id !== '' ? category_id : null,
      maintenance_type: maintenance_type || 'corretiva',
      location_description: location_description || null,
      equipment_affected: equipment_affected || null
    })
  
  if (detailsError) {
    console.error('Error creating maintenance details:', detailsError)
    // Rollback: deletar ticket
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return { error: detailsError.message }
  }
  
  // Se precisa aprovação, criar registros de aprovação
  if (needsApproval) {
    await supabase.rpc('create_ticket_approvals', { p_ticket_id: ticket.id })
  }
  
  revalidatePath('/chamados/manutencao')
  redirect(`/chamados/manutencao/${ticket.id}`)
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

/**
 * Obtém usuário atual
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

