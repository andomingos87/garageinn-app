'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================
// Types
// ============================================

export interface ClaimFilters {
  status?: string
  priority?: string
  category_id?: string
  unit_id?: string
  assigned_to?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ClaimStats {
  total: number
  awaitingTriage: number
  inProgress: number
  resolved: number
}

export interface ClaimCategory {
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
 * Busca departamento de Sinistros
 */
async function getSinistrosDepartment() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Sinistros')
    .single()
  
  if (error) {
    console.error('Error fetching Sinistros department:', error)
    return null
  }
  
  return data
}

/**
 * Lista categorias de Sinistros
 */
export async function getClaimCategories(): Promise<ClaimCategory[]> {
  const supabase = await createClient()
  
  const sinistrosDept = await getSinistrosDepartment()
  if (!sinistrosDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', sinistrosDept.id)
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
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
 * Lista sinistros com filtros
 */
export async function getClaimTickets(filters?: ClaimFilters) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  const sinistrosDept = await getSinistrosDepartment()
  if (!sinistrosDept) return { data: [], count: 0, page, limit }
  
  // Query para tickets com detalhes de sinistro
  // Nota: Usamos !ticket_id para especificar qual FK usar (há 2 FKs entre tickets e ticket_claim_details)
  let query = supabase
    .from('tickets')
    .select(`
      id,
      ticket_number,
      title,
      description,
      status,
      priority,
      perceived_urgency,
      created_at,
      updated_at,
      created_by,
      assigned_to,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
      claim_details:ticket_claim_details!ticket_id(
        occurrence_type,
        occurrence_date,
        vehicle_plate,
        customer_name,
        has_third_party
      )
    `, { count: 'exact' })
    .eq('department_id', sinistrosDept.id)
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
    query = query.eq('assigned_to', filters.assigned_to)
  }
  
  if (filters?.search) {
    const searchTerm = filters.search.trim()
    const ticketNumber = parseInt(searchTerm.replace('#', ''))
    
    if (!isNaN(ticketNumber)) {
      query = query.or(`title.ilike.%${searchTerm}%,ticket_number.eq.${ticketNumber}`)
    } else {
      // Busca por placa ou nome do cliente precisa de join
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
    console.error('Error fetching claim tickets:', error)
    return { data: [], count: 0, page, limit }
  }
  
  // Buscar perfis dos criadores
  const creatorIds = [...new Set((data || []).map((t: { created_by: string }) => t.created_by).filter(Boolean))]
  let creatorsMap: Record<string, { full_name: string; avatar_url: string | null }> = {}
  
  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', creatorIds)
    
    creatorsMap = (creators || []).reduce((acc, c) => {
      acc[c.id] = { full_name: c.full_name, avatar_url: c.avatar_url }
      return acc
    }, {} as Record<string, { full_name: string; avatar_url: string | null }>)
  }
  
  // Transformar dados para formato esperado pela tabela
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = (data || []).map((ticket: any) => ({
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    perceived_urgency: ticket.perceived_urgency,
    created_at: ticket.created_at,
    category_name: ticket.category?.name || null,
    unit_name: ticket.unit?.name || null,
    unit_code: ticket.unit?.code || null,
    // Claim specific
    occurrence_type: ticket.claim_details?.[0]?.occurrence_type || null,
    occurrence_date: ticket.claim_details?.[0]?.occurrence_date || null,
    vehicle_plate: ticket.claim_details?.[0]?.vehicle_plate || null,
    customer_name: ticket.claim_details?.[0]?.customer_name || null,
    has_third_party: ticket.claim_details?.[0]?.has_third_party || false,
    // Creator
    created_by_id: ticket.created_by || '',
    created_by_name: creatorsMap[ticket.created_by]?.full_name || 'Desconhecido',
    created_by_avatar: creatorsMap[ticket.created_by]?.avatar_url || null,
    // Counts (placeholder - would need separate queries)
    comments_count: 0,
    attachments_count: 0,
  }))
  
  return { data: transformedData, count: count || 0, page, limit }
}

/**
 * Estatísticas de Sinistros
 */
export async function getClaimStats(): Promise<ClaimStats> {
  const supabase = await createClient()
  
  const sinistrosDept = await getSinistrosDepartment()
  if (!sinistrosDept) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, resolved: 0 }
  }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', sinistrosDept.id)
  
  if (!data) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, resolved: 0 }
  }
  
  const resolvedStatuses = ['resolved', 'closed', 'cancelled', 'denied']
  const triageStatuses = ['awaiting_triage', 'awaiting_approval_encarregado', 'awaiting_approval_supervisor', 'awaiting_approval_gerente']
  
  return {
    total: data.length,
    awaitingTriage: data.filter(t => triageStatuses.includes(t.status)).length,
    inProgress: data.filter(t => !resolvedStatuses.includes(t.status) && !triageStatuses.includes(t.status)).length,
    resolved: data.filter(t => resolvedStatuses.includes(t.status)).length,
  }
}

/**
 * Verifica se o usuário atual precisa de aprovação para abrir sinistro
 */
export async function checkNeedsApproval(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return true
  
  const sinistrosDept = await getSinistrosDepartment()
  if (!sinistrosDept) return true
  
  // Verificar via RPC se precisa de aprovação
  const { data: needsApproval } = await supabase.rpc('ticket_needs_approval', {
    p_created_by: user.id,
    p_department_id: sinistrosDept.id
  })
  
  return needsApproval === true
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um sinistro
 */
export async function createClaimTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Obter departamento de Sinistros
  const sinistrosDept = await getSinistrosDepartment()
  if (!sinistrosDept) {
    return { error: 'Departamento de Sinistros não encontrado' }
  }
  
  // Extrair dados do formulário - Identificação
  const title = formData.get('title') as string
  const unit_id = formData.get('unit_id') as string | null
  const category_id = formData.get('category_id') as string | null
  const occurrence_type = formData.get('occurrence_type') as string
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  
  // Ocorrência
  const occurrence_date = formData.get('occurrence_date') as string
  const occurrence_time = formData.get('occurrence_time') as string | null
  const location_description = formData.get('location_description') as string | null
  const police_report_number = formData.get('police_report_number') as string | null
  
  // Veículo
  const vehicle_plate = formData.get('vehicle_plate') as string
  const vehicle_make = formData.get('vehicle_make') as string | null
  const vehicle_model = formData.get('vehicle_model') as string | null
  const vehicle_color = formData.get('vehicle_color') as string | null
  const vehicle_year = formData.get('vehicle_year') as string | null
  
  // Cliente
  const customer_name = formData.get('customer_name') as string
  const customer_phone = formData.get('customer_phone') as string
  const customer_email = formData.get('customer_email') as string | null
  const customer_cpf = formData.get('customer_cpf') as string | null
  
  // Terceiro
  const has_third_party = formData.get('has_third_party') === 'true'
  const third_party_name = formData.get('third_party_name') as string | null
  const third_party_phone = formData.get('third_party_phone') as string | null
  const third_party_plate = formData.get('third_party_plate') as string | null
  
  // Descrição
  const description = formData.get('description') as string
  
  // Validações
  if (!title || title.length < 5) {
    return { error: 'Título deve ter pelo menos 5 caracteres' }
  }
  if (!unit_id) {
    return { error: 'Unidade é obrigatória' }
  }
  if (!category_id) {
    return { error: 'Categoria é obrigatória' }
  }
  if (!occurrence_type) {
    return { error: 'Tipo de ocorrência é obrigatório' }
  }
  if (!occurrence_date) {
    return { error: 'Data da ocorrência é obrigatória' }
  }
  if (!vehicle_plate) {
    return { error: 'Placa do veículo é obrigatória' }
  }
  if (!customer_name) {
    return { error: 'Nome do cliente é obrigatório' }
  }
  if (!customer_phone) {
    return { error: 'Telefone do cliente é obrigatório' }
  }
  if (!description || description.length < 20) {
    return { error: 'Descrição deve ter pelo menos 20 caracteres' }
  }
  
  // Verificar se precisa de aprovação
  const { data: needsApproval } = await supabase.rpc('ticket_needs_approval', {
    p_created_by: user.id,
    p_department_id: sinistrosDept.id
  })
  
  const initialStatus = needsApproval 
    ? 'awaiting_approval_encarregado' 
    : 'awaiting_triage'
  
  // Criar ticket principal
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      title,
      description,
      department_id: sinistrosDept.id,
      category_id: category_id && category_id !== '' ? category_id : null,
      unit_id: unit_id && unit_id !== '' ? unit_id : null,
      created_by: user.id,
      status: initialStatus,
      perceived_urgency: perceived_urgency && perceived_urgency !== '' ? perceived_urgency : null
    })
    .select()
    .single()
  
  if (ticketError) {
    console.error('Error creating ticket:', ticketError)
    return { error: ticketError.message }
  }
  
  // Criar detalhes do sinistro
  const { error: detailsError } = await supabase
    .from('ticket_claim_details')
    .insert({
      ticket_id: ticket.id,
      occurrence_type,
      occurrence_date: `${occurrence_date}T${occurrence_time || '00:00'}:00`,
      occurrence_time: occurrence_time || null,
      location_description: location_description || null,
      police_report_number: police_report_number || null,
      vehicle_plate: vehicle_plate.toUpperCase(),
      vehicle_make: vehicle_make || null,
      vehicle_model: vehicle_model || null,
      vehicle_color: vehicle_color || null,
      vehicle_year: vehicle_year ? parseInt(vehicle_year) : null,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      customer_cpf: customer_cpf || null,
      has_third_party,
      third_party_name: has_third_party ? third_party_name : null,
      third_party_phone: has_third_party ? third_party_phone : null,
      third_party_plate: has_third_party ? third_party_plate?.toUpperCase() : null,
    })
  
  if (detailsError) {
    console.error('Error creating claim details:', detailsError)
    // Rollback: deletar ticket
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return { error: detailsError.message }
  }
  
  // Se precisa aprovação, criar registros de aprovação
  if (needsApproval) {
    await supabase.rpc('create_ticket_approvals', { p_ticket_id: ticket.id })
  }
  
  revalidatePath('/chamados/sinistros')
  redirect(`/chamados/sinistros/${ticket.id}`)
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

// ============================================
// Import constants for status transitions
// ============================================

import { statusTransitions, statusLabels } from './constants'

// ============================================
// Triage Functions
// ============================================

/**
 * Busca departamento de Sinistros (helper)
 */
async function getSinistrosDepartmentId() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Sinistros')
    .single()
  
  if (error) {
    console.error('Error fetching Sinistros department:', error)
    return null
  }
  
  return data?.id || null
}

/**
 * Verifica se o usuário pode triar sinistros
 */
export async function canTriageClaimTicket(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  // Verificar se é admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true
  
  // Buscar roles do usuário
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(
        name,
        department:departments!department_id(name)
      )
    `)
    .eq('user_id', user.id)
  
  if (!userRoles) return false
  
  // Verificar se tem cargo de triagem (Supervisor, Gerente, Coordenador) no departamento de Sinistros
  const triageRoles = ['Supervisor', 'Gerente', 'Coordenador', 'Analista']
  
  return userRoles.some(ur => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = ur.role as any
    const roleName = role?.name
    const deptName = role?.department?.name?.toLowerCase()
    
    return triageRoles.includes(roleName) && deptName === 'sinistros'
  })
}

/**
 * Lista membros do departamento de Sinistros
 */
export async function getSinistrosDepartmentMembers() {
  const supabase = await createClient()
  
  const sinistrosDeptId = await getSinistrosDepartmentId()
  if (!sinistrosDeptId) return []
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      user:profiles!user_id(id, full_name, email, avatar_url),
      role:roles!role_id(name, department_id)
    `)
  
  // Filtrar por departamento de Sinistros, removendo duplicatas
  const membersMap = new Map<string, { id: string; full_name: string; email: string; avatar_url: string | null; role: string }>()
  
  data?.forEach((d: Record<string, unknown>) => {
    const role = d.role as { department_id: string; name: string } | null
    const user = d.user as { id: string; full_name: string; email: string; avatar_url: string | null } | null
    
    if (role && user && role.department_id === sinistrosDeptId) {
      // Se já existe, não sobrescreve (mantém o primeiro cargo encontrado)
      if (!membersMap.has(user.id)) {
        membersMap.set(user.id, {
          ...user,
          role: role.name
        })
      }
    }
  })
  
  return Array.from(membersMap.values())
}

/**
 * Triar sinistro
 */
export async function triageClaimTicket(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar permissão de triagem
  const canTriage = await canTriageClaimTicket()
  if (!canTriage) {
    return { error: 'Sem permissão para triar sinistros' }
  }
  
  // Extrair dados do formulário
  const priority = formData.get('priority') as string
  const assigned_to = formData.get('assigned_to') as string | null
  const due_date = formData.get('due_date') as string | null
  
  // Validações
  if (!priority) {
    return { error: 'Prioridade é obrigatória' }
  }
  
  // Verificar se o ticket existe e está aguardando triagem
  const { data: ticket } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single()
  
  if (!ticket) {
    return { error: 'Sinistro não encontrado' }
  }
  
  if (ticket.status !== 'awaiting_triage') {
    return { error: 'Este sinistro não está aguardando triagem' }
  }
  
  // Atualizar ticket
  const { error } = await supabase
    .from('tickets')
    .update({
      priority,
      assigned_to: assigned_to && assigned_to !== '' ? assigned_to : null,
      due_date: due_date || null,
      status: 'in_analysis' // Avança para análise após triagem
    })
    .eq('id', ticketId)
  
  if (error) {
    console.error('Error triaging claim ticket:', error)
    return { error: error.message }
  }
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: 'triaged',
    new_value: `Prioridade: ${priority}`,
    metadata: { priority, assigned_to, due_date }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  revalidatePath('/chamados/sinistros')
  return { success: true }
}

/**
 * Muda status do sinistro
 */
export async function changeClaimStatus(
  ticketId: string, 
  newStatus: string, 
  reason?: string
) {
  const supabase = await createClient()
  
  const { data: ticket } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single()
  
  if (!ticket) {
    return { error: 'Sinistro não encontrado' }
  }
  
  const allowedTransitions = statusTransitions[ticket.status] || []
  if (!allowedTransitions.includes(newStatus)) {
    return { error: `Transição de ${statusLabels[ticket.status]} para ${statusLabels[newStatus]} não permitida` }
  }
  
  const updates: Record<string, unknown> = { status: newStatus }
  
  if (newStatus === 'denied' && reason) {
    updates.denial_reason = reason
  }
  
  if (newStatus === 'closed') {
    updates.closed_at = new Date().toISOString()
  }
  
  if (newStatus === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
  
  if (error) {
    console.error('Error changing claim status:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  revalidatePath('/chamados/sinistros')
  return { success: true }
}

