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

export interface RHCategory {
  id: string
  name: string
  department_id: string
  status: string
}

export interface Uniform {
  id: string
  name: string
  size: string | null
  type: string | null
  current_stock: number
}

// ============================================
// Query Functions
// ============================================

/**
 * Busca departamento de RH
 */
async function getRHDepartment() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'RH')
    .single()
  
  if (error) {
    console.error('Error fetching RH department:', error)
    return null
  }
  
  return data
}

/**
 * Lista categorias de RH
 */
export async function getRHCategories(): Promise<RHCategory[]> {
  const supabase = await createClient()
  
  const rhDept = await getRHDepartment()
  if (!rhDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', rhDept.id)
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching RH categories:', error)
    return []
  }
  
  return data || []
}

/**
 * Lista uniformes disponíveis
 */
export async function getUniforms(): Promise<Uniform[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('uniforms')
    .select('id, name, size, type, current_stock')
    .order('name')
  
  if (error) {
    console.error('Error fetching uniforms:', error)
    return []
  }
  
  return data || []
}

/**
 * Lista chamados de RH com filtros
 */
export async function getRHTickets(filters?: TicketFilters) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  const rhDept = await getRHDepartment()
  if (!rhDept) return { data: [], count: 0, page, limit }
  
  let query = supabase
    .from('tickets_with_details')
    .select('*', { count: 'exact' })
    .eq('department_id', rhDept.id)
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
  
  if (filters?.search) {
    const searchTerm = filters.search.trim()
    const ticketNumber = parseInt(searchTerm.replace('#', ''))
    
    if (!isNaN(ticketNumber)) {
      query = query.or(`title.ilike.%${searchTerm}%,ticket_number.eq.${ticketNumber}`)
    } else {
      query = query.ilike('title', `%${searchTerm}%`)
    }
  }
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching RH tickets:', error)
    return { data: [], count: 0, page, limit }
  }
  
  return { data: data || [], count: count || 0, page, limit }
}

/**
 * Estatísticas de Chamados de RH
 */
export async function getRHStats() {
  const supabase = await createClient()
  
  const rhDept = await getRHDepartment()
  if (!rhDept) {
    return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', rhDept.id)
  
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

// ============================================
// Mutation Functions
// ============================================

/**
 * Cria um chamado de RH
 */
export async function createRHTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const rhDept = await getRHDepartment()
  if (!rhDept) {
    return { error: 'Departamento de RH não encontrado' }
  }
  
  // Extrair dados básicos
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string | null
  const unit_id = formData.get('unit_id') as string | null
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  
  // Dados específicos de RH
  const rh_type = formData.get('rh_type') as string // personnel, salary, benefit, uniform, other
  const withdrawal_reason = formData.get('withdrawal_reason') as string | null
  
  // Validações básicas
  if (!title || title.length < 5) {
    return { error: 'Título deve ter pelo menos 5 caracteres' }
  }
  if (!description || description.length < 10) {
    return { error: 'Descrição deve ter pelo menos 10 caracteres' }
  }
  if (!rh_type) {
    return { error: 'Tipo de chamado de RH é obrigatório' }
  }

  // Verificar se precisa de aprovação (mesma regra da Operação)
  const { data: needsApproval } = await supabase.rpc('ticket_needs_approval', {
    p_created_by: user.id,
    p_department_id: rhDept.id
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
      department_id: rhDept.id,
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
  
  // Criar detalhes de RH
  const specific_fields: Record<string, any> = {}
  
  // Se for uniforme, extrair dados do uniforme
  if (rh_type === 'uniform') {
    specific_fields.uniform_id = formData.get('uniform_id')
    specific_fields.quantity = parseInt(formData.get('quantity') as string) || 1
  }

  const { error: detailsError } = await supabase
    .from('ticket_rh_details')
    .insert({
      ticket_id: ticket.id,
      rh_type,
      withdrawal_reason: rh_type === 'uniform' ? withdrawal_reason : null,
      specific_fields
    })
  
  if (detailsError) {
    console.error('Error creating RH details:', detailsError)
    // Rollback
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return { error: detailsError.message }
  }
  
  // Se precisa aprovação, criar registros de aprovação
  if (needsApproval) {
    await supabase.rpc('create_ticket_approvals', { p_ticket_id: ticket.id })
  }
  
  revalidatePath('/chamados/rh')
  revalidatePath('/chamados')
  
  return { success: true, ticketId: ticket.id }
}

/**
 * Busca detalhes completos do chamado de RH
 */
export async function getRHTicketDetails(ticketId: string) {
  const supabase = await createClient()
  
  // Buscar ticket com detalhes básicos
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets_with_details')
    .select('*')
    .eq('id', ticketId)
    .single()
  
  if (ticketError || !ticket) {
    console.error('Error fetching ticket details:', ticketError)
    return null
  }
  
  // Buscar detalhes específicos de RH
  const { data: rhDetails } = await supabase
    .from('ticket_rh_details')
    .select('*')
    .eq('ticket_id', ticketId)
    .single()
  
  // Se for uniforme, buscar info do uniforme
  let uniform = null
  if (rhDetails?.rh_type === 'uniform' && rhDetails.specific_fields?.uniform_id) {
    const { data: uniformData } = await supabase
      .from('uniforms')
      .select('*')
      .eq('id', rhDetails.specific_fields.uniform_id)
      .single()
    uniform = uniformData
  }
  
  // Buscar comentários, histórico, aprovações e anexos (reutilizando lógica similar a compras)
  const [comments, history, approvals, attachments] = await Promise.all([
    supabase.from('ticket_comments').select('*, author:profiles!user_id(id, full_name, avatar_url)').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
    supabase.from('ticket_history').select('*, user:profiles!user_id(id, full_name, avatar_url)').eq('ticket_id', ticketId).order('created_at', { ascending: false }),
    supabase.from('ticket_approvals').select('*, approver:profiles!approved_by(id, full_name, avatar_url)').eq('ticket_id', ticketId).order('approval_level', { ascending: true }),
    supabase.from('ticket_attachments').select('*, uploader:profiles!uploaded_by(id, full_name, avatar_url)').eq('ticket_id', ticketId).order('created_at', { ascending: false })
  ])

  return {
    ...ticket,
    rh_details: rhDetails,
    uniform,
    comments: comments.data || [],
    history: history.data || [],
    approvals: approvals.data || [],
    attachments: attachments.data || []
  }
}

/**
 * Muda status do chamado de RH
 */
export async function changeRHTicketStatus(
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
  
  revalidatePath(`/chamados/rh/${ticketId}`)
  revalidatePath('/chamados/rh')
  return { success: true }
}

/**
 * Verifica se o usuário atual pode triar chamados de RH
 */
export async function canTriageRHTicket(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  // Admin pode tudo
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true
  
  const rhDept = await getRHDepartment()
  if (!rhDept) return false
  
  // Verificar se usuário tem cargo de triagem no departamento de RH
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name, department_id)
    `)
    .eq('user_id', user.id)
  
  const TRIAGE_ROLES = ['Gerente', 'Supervisor', 'Coordenador', 'Analista']
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasTriageRole = userRoles?.some((ur: any) => {
    const role = ur.role
    if (!role) return false
    return role.department_id === rhDept.id && TRIAGE_ROLES.includes(role.name)
  })
  
  return hasTriageRole || false
}

/**
 * Lista membros do departamento de RH
 */
export async function getRHDepartmentMembers() {
  const supabase = await createClient()
  
  const rhDept = await getRHDepartment()
  if (!rhDept) return []
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      user:profiles!user_id(id, full_name, email, avatar_url),
      role:roles!role_id(name, department_id)
    `)
    .eq('roles.department_id', rhDept.id)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((d: any) => ({
    ...d.user,
    role: d.role?.name
  }))
}

/**
 * Triar chamado de RH
 */
export async function triageRHTicket(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  const priority = formData.get('priority') as string
  const assigned_to = formData.get('assigned_to') as string
  const due_date = formData.get('due_date') as string | null
  
  if (!priority || !assigned_to) {
    return { error: 'Prioridade e responsável são obrigatórios' }
  }
  
  const { error } = await supabase
    .from('tickets')
    .update({
      priority,
      assigned_to,
      due_date: due_date || null,
      status: 'in_progress'
    })
    .eq('id', ticketId)
  
  revalidatePath(`/chamados/rh/${ticketId}`)
  revalidatePath('/chamados/rh')
  return { success: true }
}

/**
 * Adiciona comentário ao chamado de RH
 */
export async function addRHComment(ticketId: string, formData: FormData) {
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
  
  revalidatePath(`/chamados/rh/${ticketId}`)
  return { success: true }
}

/**
 * Aprovar/Rejeitar chamado de RH
 */
export async function handleRHApproval(
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
  
  revalidatePath(`/chamados/rh/${ticketId}`)
  revalidatePath('/chamados/rh')
  return { success: true }
}

/**
 * Entrega uniforme e dá baixa automática no estoque
 */
export async function deliverUniform(ticketId: string, notes?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Buscar detalhes do chamado de RH
  const { data: rhDetails, error: rhError } = await supabase
    .from('ticket_rh_details')
    .select('*')
    .eq('ticket_id', ticketId)
    .single()
  
  if (rhError || !rhDetails) {
    return { error: 'Detalhes do chamado não encontrados' }
  }
  
  if (rhDetails.rh_type !== 'uniform') {
    return { error: 'Este chamado não é de uniforme' }
  }
  
  const uniformId = rhDetails.specific_fields?.uniform_id
  const quantity = rhDetails.specific_fields?.quantity || 1
  
  if (!uniformId) {
    return { error: 'Uniforme não especificado no chamado' }
  }
  
  // Buscar uniforme e verificar estoque
  const { data: uniform, error: uniformError } = await supabase
    .from('uniforms')
    .select('id, name, current_stock')
    .eq('id', uniformId)
    .single()
  
  if (uniformError || !uniform) {
    return { error: 'Uniforme não encontrado' }
  }
  
  if (uniform.current_stock < quantity) {
    return { 
      error: `Estoque insuficiente. Disponível: ${uniform.current_stock}, Solicitado: ${quantity}` 
    }
  }
  
  // Buscar dados do ticket para pegar unit_id e created_by
  const { data: ticket } = await supabase
    .from('tickets')
    .select('unit_id, created_by')
    .eq('id', ticketId)
    .single()
  
  // Dar baixa no estoque
  const newStock = uniform.current_stock - quantity
  const { error: updateError } = await supabase
    .from('uniforms')
    .update({ 
      current_stock: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', uniformId)
  
  if (updateError) {
    console.error('Error updating stock:', updateError)
    return { error: 'Erro ao atualizar estoque' }
  }
  
  // Registrar transação de saída
  const { error: transactionError } = await supabase
    .from('uniform_transactions')
    .insert({
      uniform_id: uniformId,
      user_id: ticket?.created_by || null,
      unit_id: ticket?.unit_id || null,
      type: 'saida',
      quantity: quantity,
      ticket_id: ticketId
    })
  
  if (transactionError) {
    console.error('Error creating transaction:', transactionError)
    // Não falha a operação, apenas loga
  }
  
  // Atualizar status do chamado para resolvido
  const { error: ticketError } = await supabase
    .from('tickets')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    .eq('id', ticketId)
  
  if (ticketError) {
    console.error('Error updating ticket status:', ticketError)
    return { error: 'Erro ao atualizar status do chamado' }
  }
  
  // Adicionar comentário se houver observações
  if (notes?.trim()) {
    await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        content: `Uniforme entregue. ${notes}`,
        is_internal: false
      })
  }
  
  revalidatePath(`/chamados/rh/${ticketId}`)
  revalidatePath('/chamados/rh')
  revalidatePath('/configuracoes/uniformes')
  
  return { success: true, newStock }
}

/**
 * Verifica se o chamado de uniforme pode ser entregue (tem estoque)
 */
export async function checkUniformStock(ticketId: string) {
  const supabase = await createClient()
  
  const { data: rhDetails } = await supabase
    .from('ticket_rh_details')
    .select('specific_fields')
    .eq('ticket_id', ticketId)
    .single()
  
  if (!rhDetails?.specific_fields?.uniform_id) {
    return { canDeliver: false, reason: 'Uniforme não especificado' }
  }
  
  const { data: uniform } = await supabase
    .from('uniforms')
    .select('current_stock, name')
    .eq('id', rhDetails.specific_fields.uniform_id)
    .single()
  
  if (!uniform) {
    return { canDeliver: false, reason: 'Uniforme não encontrado' }
  }
  
  const quantity = rhDetails.specific_fields.quantity || 1
  
  if (uniform.current_stock < quantity) {
    return { 
      canDeliver: false, 
      reason: `Estoque insuficiente (${uniform.current_stock}/${quantity})`,
      currentStock: uniform.current_stock,
      requestedQuantity: quantity
    }
  }
  
  return { 
    canDeliver: true, 
    currentStock: uniform.current_stock,
    requestedQuantity: quantity
  }
}

