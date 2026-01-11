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

export interface PurchaseCategory {
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
 * Busca departamento de Compras e Manutenção
 */
async function getComprasDepartment() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras e Manutenção')
    .single()
  
  if (error) {
    console.error('Error fetching Compras department:', error)
    return null
  }
  
  return data
}

/**
 * Lista categorias de Compras
 */
export async function getPurchaseCategories(): Promise<PurchaseCategory[]> {
  const supabase = await createClient()
  
  const comprasDept = await getComprasDepartment()
  if (!comprasDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', comprasDept.id)
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data || []
}

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

/**
 * Lista chamados de Compras com filtros
 */
export async function getPurchaseTickets(filters?: TicketFilters) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  const comprasDept = await getComprasDepartment()
  if (!comprasDept) return { data: [], count: 0, page, limit }
  
  let query = supabase
    .from('tickets_with_details')
    .select('*', { count: 'exact' })
    .eq('department_id', comprasDept.id)
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
    console.error('Error fetching tickets:', error)
    return { data: [], count: 0, page, limit }
  }
  
  return { data: data || [], count: count || 0, page, limit }
}

/**
 * Estatísticas de Chamados de Compras
 */
export async function getPurchaseStats(): Promise<TicketStats> {
  const supabase = await createClient()
  
  const comprasDept = await getComprasDepartment()
  if (!comprasDept) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', comprasDept.id)
  
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
 * Busca um chamado por ID
 */
export async function getTicketById(ticketId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets_with_details')
    .select('*')
    .eq('id', ticketId)
    .single()
  
  if (error) {
    console.error('Error fetching ticket:', error)
    return null
  }
  
  return data
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um chamado de Compras
 */
export async function createPurchaseTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Obter departamento de Compras
  const comprasDept = await getComprasDepartment()
  if (!comprasDept) {
    return { error: 'Departamento de Compras não encontrado' }
  }
  
  // Extrair dados do formulário
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string | null
  const unit_id = formData.get('unit_id') as string | null
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  const item_name = formData.get('item_name') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const unit_of_measure = (formData.get('unit_of_measure') as string) || 'un'
  const estimated_price = formData.get('estimated_price') 
    ? parseFloat(formData.get('estimated_price') as string) 
    : null
  
  // Validações
  if (!title || title.length < 5) {
    return { error: 'Título deve ter pelo menos 5 caracteres' }
  }
  if (!item_name || item_name.length < 3) {
    return { error: 'Nome do item deve ter pelo menos 3 caracteres' }
  }
  if (!quantity || quantity <= 0) {
    return { error: 'Quantidade deve ser maior que zero' }
  }
  if (!description || description.length < 10) {
    return { error: 'Justificativa deve ter pelo menos 10 caracteres' }
  }
  
  // Verificar se precisa de aprovação
  const { data: needsApproval } = await supabase.rpc('ticket_needs_approval', {
    p_created_by: user.id,
    p_department_id: comprasDept.id
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
      department_id: comprasDept.id,
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
  
  // Criar detalhes de compra
  const { error: detailsError } = await supabase
    .from('ticket_purchase_details')
    .insert({
      ticket_id: ticket.id,
      item_name,
      quantity,
      unit_of_measure,
      estimated_price
    })
  
  if (detailsError) {
    console.error('Error creating purchase details:', detailsError)
    // Rollback: deletar ticket
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return { error: detailsError.message }
  }
  
  // Se precisa aprovação, criar registros de aprovação
  if (needsApproval) {
    await supabase.rpc('create_ticket_approvals', { p_ticket_id: ticket.id })
  }
  
  revalidatePath('/chamados/compras')
  redirect(`/chamados/compras/${ticket.id}`)
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
// Ticket Details Functions
// ============================================

/**
 * Busca detalhes completos do chamado com cotações, aprovações, etc.
 */
export async function getTicketDetails(ticketId: string) {
  const supabase = await createClient()
  
  // Buscar ticket com detalhes
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets_with_details')
    .select('*')
    .eq('id', ticketId)
    .single()
  
  if (ticketError || !ticket) {
    console.error('Error fetching ticket details:', ticketError)
    return null
  }
  
  // Buscar cotações
  const { data: quotations } = await supabase
    .from('ticket_quotations')
    .select(`
      *,
      creator:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  
  // Buscar aprovações
  const { data: approvals } = await supabase
    .from('ticket_approvals')
    .select(`
      *,
      approver:profiles!approved_by(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('approval_level', { ascending: true })
  
  // Buscar comentários
  const { data: comments } = await supabase
    .from('ticket_comments')
    .select(`
      *,
      author:profiles!user_id(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  
  // Buscar histórico
  const { data: history } = await supabase
    .from('ticket_history')
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  
  // Buscar anexos
  const { data: attachments } = await supabase
    .from('ticket_attachments')
    .select(`
      *,
      uploader:profiles!uploaded_by(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  
  return {
    ...ticket,
    quotations: quotations || [],
    approvals: approvals || [],
    comments: comments || [],
    history: history || [],
    attachments: attachments || [],
  }
}

/**
 * Obtém histórico do chamado
 */
export async function getTicketHistory(ticketId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ticket_history')
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching ticket history:', error)
    return []
  }
  
  return data || []
}

// ============================================
// Quotation Functions
// ============================================

/**
 * Adiciona cotação ao chamado
 */
export async function addQuotation(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const supplier_name = formData.get('supplier_name') as string
  const supplier_cnpj = formData.get('supplier_cnpj') as string | null
  const supplier_contact = formData.get('supplier_contact') as string | null
  const unit_price = parseFloat(formData.get('unit_price') as string)
  const quantity = parseInt(formData.get('quantity') as string)
  const total_price = unit_price * quantity
  const payment_terms = formData.get('payment_terms') as string | null
  const delivery_deadline = formData.get('delivery_deadline') as string | null
  const validity_date = formData.get('validity_date') as string | null
  const notes = formData.get('notes') as string | null
  
  // Validações
  if (!supplier_name || supplier_name.length < 2) {
    return { error: 'Nome do fornecedor é obrigatório' }
  }
  if (!unit_price || unit_price <= 0) {
    return { error: 'Preço unitário deve ser maior que zero' }
  }
  if (!quantity || quantity <= 0) {
    return { error: 'Quantidade deve ser maior que zero' }
  }
  
  const { error } = await supabase
    .from('ticket_quotations')
    .insert({
      ticket_id: ticketId,
      supplier_name,
      supplier_cnpj: supplier_cnpj || null,
      supplier_contact: supplier_contact || null,
      unit_price,
      quantity,
      total_price,
      payment_terms: payment_terms || null,
      delivery_deadline: delivery_deadline || null,
      validity_date: validity_date || null,
      notes: notes || null,
      created_by: user.id
    })
  
  if (error) {
    console.error('Error adding quotation:', error)
    return { error: error.message }
  }
  
  // Atualizar status se ainda não estiver em cotação
  await supabase
    .from('tickets')
    .update({ status: 'quoting' })
    .eq('id', ticketId)
    .in('status', ['awaiting_triage', 'in_progress'])
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

/**
 * Seleciona cotação vencedora
 */
export async function selectQuotation(ticketId: string, quotationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Desmarcar outras cotações
  await supabase
    .from('ticket_quotations')
    .update({ is_selected: false, status: 'pending' })
    .eq('ticket_id', ticketId)
  
  // Marcar cotação selecionada
  const { error } = await supabase
    .from('ticket_quotations')
    .update({ is_selected: true, status: 'approved' })
    .eq('id', quotationId)
  
  if (error) {
    console.error('Error selecting quotation:', error)
    return { error: error.message }
  }
  
  // Vincular aos detalhes de compra
  await supabase
    .from('ticket_purchase_details')
    .update({ approved_quotation_id: quotationId })
    .eq('ticket_id', ticketId)
  
  // Atualizar status do ticket
  await supabase
    .from('tickets')
    .update({ status: 'approved' })
    .eq('id', ticketId)
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

/**
 * Remove cotação
 */
export async function deleteQuotation(ticketId: string, quotationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('ticket_quotations')
    .delete()
    .eq('id', quotationId)
    .eq('ticket_id', ticketId)
  
  if (error) {
    console.error('Error deleting quotation:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

// ============================================
// Status Functions
// ============================================

import { statusTransitions, statusLabels } from './constants'

/**
 * Muda status do chamado
 */
export async function changeTicketStatus(
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
    return { error: 'Chamado não encontrado' }
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
  
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
  
  if (error) {
    console.error('Error changing ticket status:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  revalidatePath('/chamados/compras')
  return { success: true }
}

// ============================================
// Triage Functions
// ============================================

/**
 * Cargos que podem fazer triagem de chamados de Compras
 */
const TRIAGE_ROLES = ['Desenvolvedor', 'Administrador', 'Diretor', 'Gerente', 'Supervisor', 'Coordenador']

/**
 * Verifica se o usuário atual pode triar chamados de Compras
 */
export async function canTriageTicket(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  // Admin pode tudo
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true
  
  // Obter os departamentos de Compras (pode ter "Compras" ou "Compras e Manutenção")
  const { data: comprasDepts } = await supabase
    .from('departments')
    .select('id')
    .or('name.eq.Compras,name.eq.Compras e Manutenção')
  
  if (!comprasDepts || comprasDepts.length === 0) return false
  
  const deptIds = comprasDepts.map(d => d.id)
  
  // Verificar se usuário tem cargo de triagem no departamento de Compras
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name, department_id)
    `)
    .eq('user_id', user.id)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasTriageRole = userRoles?.some((ur: any) => {
    const role = ur.role
    if (!role) return false
    
    // Se é um cargo global de triagem
    if (['Desenvolvedor', 'Administrador', 'Diretor'].includes(role.name)) return true
    
    // Se é um cargo de triagem dentro do departamento de Compras
    return deptIds.includes(role.department_id) && TRIAGE_ROLES.includes(role.name)
  })
  
  return hasTriageRole || false
}

/**
 * Lista membros do departamento de Compras
 */
export async function getComprasDepartmentMembers() {
  const supabase = await createClient()
  
  // Buscar departamentos de Compras (pode ter "Compras" ou "Compras e Manutenção")
  const { data: comprasDepts } = await supabase
    .from('departments')
    .select('id')
    .or('name.eq.Compras,name.eq.Compras e Manutenção')
  
  if (!comprasDepts || comprasDepts.length === 0) return []
  
  const deptIds = comprasDepts.map(d => d.id)
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      user:profiles!user_id(id, full_name, email, avatar_url),
      role:roles!role_id(name, department_id)
    `)
  
  // Filtrar por departamentos de Compras, removendo duplicatas
  const membersMap = new Map<string, { id: string; full_name: string; email: string; avatar_url: string | null; role: string }>()
  
  data?.forEach((d: Record<string, unknown>) => {
    const role = d.role as { department_id: string; name: string } | null
    const user = d.user as { id: string; full_name: string; email: string; avatar_url: string | null } | null
    
    if (role && user && deptIds.includes(role.department_id)) {
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
 * Triar chamado
 * 
 * Apenas Supervisores, Gerentes ou Coordenadores do departamento de Compras
 * (ou admins globais) podem triar chamados.
 */
export async function triageTicket(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar permissão de triagem
  const canTriage = await canTriageTicket()
  if (!canTriage) {
    return { error: 'Você não tem permissão para fazer triagem de chamados' }
  }
  
  // Verificar se o chamado existe e está aguardando triagem
  const { data: ticket } = await supabase
    .from('tickets')
    .select('status, priority, assigned_to')
    .eq('id', ticketId)
    .single()
  
  if (!ticket) {
    return { error: 'Chamado não encontrado' }
  }
  
  if (ticket.status !== 'awaiting_triage') {
    return { error: 'Este chamado não está aguardando triagem' }
  }
  
  const priority = formData.get('priority') as string
  const assigned_to = formData.get('assigned_to') as string
  const due_date = formData.get('due_date') as string | null
  
  // Validações
  if (!priority) {
    return { error: 'Prioridade é obrigatória' }
  }
  if (!assigned_to) {
    return { error: 'Responsável é obrigatório' }
  }
  
  // Validar se a prioridade é válida
  const validPriorities = ['low', 'medium', 'high', 'urgent']
  if (!validPriorities.includes(priority)) {
    return { error: 'Prioridade inválida' }
  }
  
  // Atualizar o chamado
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      priority,
      assigned_to,
      due_date: due_date || null,
      status: 'in_progress'
    })
    .eq('id', ticketId)
  
  if (updateError) {
    console.error('Error triaging ticket:', updateError)
    return { error: updateError.message }
  }
  
  // Registrar histórico de triagem manualmente (além do trigger automático)
  // para incluir metadados adicionais sobre a triagem
  await supabase
    .from('ticket_history')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      action: 'triaged',
      old_value: 'awaiting_triage',
      new_value: 'in_progress',
      metadata: {
        priority,
        assigned_to,
        due_date: due_date || null,
        triaged_by: user.id
      }
    })
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  revalidatePath('/chamados/compras')
  return { success: true }
}

// ============================================
// Comment Functions
// ============================================

/**
 * Adiciona comentário ao chamado
 */
export async function addComment(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const content = formData.get('content') as string
  const is_internal = formData.get('is_internal') === 'true'
  
  if (!content || content.trim().length < 1) {
    return { error: 'Comentário não pode ser vazio' }
  }
  
  const { error } = await supabase
    .from('ticket_comments')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      content: content.trim(),
      is_internal
    })
  
  if (error) {
    console.error('Error adding comment:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

// ============================================
// Approval Functions
// ============================================

/**
 * Aprovar/Rejeitar chamado
 */
export async function handleApproval(
  ticketId: string,
  approvalId: string,
  decision: 'approved' | 'rejected',
  notes?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const { data: approval } = await supabase
    .from('ticket_approvals')
    .select('approval_level, approval_role')
    .eq('id', approvalId)
    .single()
  
  if (!approval) {
    return { error: 'Aprovação não encontrada' }
  }
  
  // Atualizar aprovação
  const { error } = await supabase
    .from('ticket_approvals')
    .update({
      approved_by: user.id,
      status: decision,
      decision_at: new Date().toISOString(),
      notes: notes || null
    })
    .eq('id', approvalId)
  
  if (error) {
    console.error('Error handling approval:', error)
    return { error: error.message }
  }
  
  // Atualizar status do ticket
  if (decision === 'rejected') {
    await supabase
      .from('tickets')
      .update({
        status: 'denied',
        denial_reason: notes || 'Negado na aprovação'
      })
      .eq('id', ticketId)
  } else {
    // Aprovar e avançar para próximo nível ou triagem
    const nextStatusMap: Record<number, string> = {
      1: 'awaiting_approval_supervisor',
      2: 'awaiting_approval_gerente',
      3: 'awaiting_triage'
    }
    
    await supabase
      .from('tickets')
      .update({ status: nextStatusMap[approval.approval_level] })
      .eq('id', ticketId)
  }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  revalidatePath('/chamados/compras')
  return { success: true }
}

/**
 * Lista aprovações pendentes para o usuário
 */
export async function getPendingApprovals() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Verificar cargo do usuário
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name)
    `)
    .eq('user_id', user.id)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = userRoles?.map((r: any) => r.role?.name).filter(Boolean) || []
  
  let approvalLevel: number | null = null
  if (roles.includes('Encarregado')) approvalLevel = 1
  else if (roles.includes('Supervisor')) approvalLevel = 2
  else if (roles.includes('Gerente')) approvalLevel = 3
  
  if (!approvalLevel) return []
  
  const { data } = await supabase
    .from('ticket_approvals')
    .select(`
      *,
      ticket:tickets(
        id,
        ticket_number,
        title,
        created_by,
        created_at,
        creator:profiles!created_by(full_name)
      )
    `)
    .eq('approval_level', approvalLevel)
    .eq('status', 'pending')
  
  return data || []
}

/**
 * Verificar se usuário pode gerenciar o chamado
 */
export async function canManageTicket(ticketId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  // Admin pode tudo
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true
  
  // Verificar se é do departamento de Compras
  const comprasDept = await getComprasDepartment()
  if (!comprasDept) return false
  
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(department_id, name)
    `)
    .eq('user_id', user.id)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isComprasMember = userRoles?.some((ur: any) => 
    ur.role?.department_id === comprasDept.id
  )
  
  return isComprasMember || false
}

