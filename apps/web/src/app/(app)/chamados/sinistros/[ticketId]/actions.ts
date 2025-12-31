'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Ticket Details Functions (Fase 3)
// ============================================

/**
 * Busca detalhes completos do sinistro
 */
export async function getClaimTicketDetails(ticketId: string) {
  const supabase = await createClient()
  
  // Buscar ticket com detalhes
  // Nota: Usamos !ticket_id para especificar qual FK usar (há 2 FKs entre tickets e ticket_claim_details)
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
      creator:profiles!created_by(id, full_name, avatar_url, email),
      assignee:profiles!assigned_to(id, full_name, avatar_url, email),
      claim_details:ticket_claim_details!ticket_id(*)
    `)
    .eq('id', ticketId)
    .single()
  
  if (ticketError || !ticket) {
    console.error('Error fetching claim ticket details:', ticketError)
    return null
  }
  
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
  
  // Buscar comunicações
  const claimDetailsId = ticket.claim_details?.[0]?.id
  let communications: unknown[] = []
  
  if (claimDetailsId) {
    const { data: comms } = await supabase
      .from('claim_communications')
      .select(`
        *,
        creator:profiles!created_by(id, full_name, avatar_url)
      `)
      .eq('claim_details_id', claimDetailsId)
      .order('communication_date', { ascending: false })
    
    communications = comms || []
  }
  
  // Buscar compras internas
  let purchases: unknown[] = []
  
  if (claimDetailsId) {
    const { data: purchasesData } = await supabase
      .from('claim_purchases')
      .select(`
        *,
        assigned:profiles!assigned_to(id, full_name, avatar_url),
        approver:profiles!approved_by(id, full_name, avatar_url),
        creator:profiles!created_by(id, full_name, avatar_url),
        items:claim_purchase_items(*),
        quotations:claim_purchase_quotations(
          *,
          supplier:accredited_suppliers(id, name, cnpj),
          creator:profiles!created_by(id, full_name, avatar_url)
        )
      `)
      .eq('claim_details_id', claimDetailsId)
      .order('created_at', { ascending: false })
    
    purchases = purchasesData || []
  }
  
  return {
    ...ticket,
    approvals: approvals || [],
    comments: comments || [],
    history: history || [],
    attachments: attachments || [],
    communications,
    purchases,
  }
}

// ============================================
// Communication Functions (Fase 3)
// ============================================

/**
 * Adiciona comunicação com cliente
 */
export async function addClaimCommunication(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Buscar claim_details_id
  const { data: ticket } = await supabase
    .from('ticket_claim_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .single()
  
  if (!ticket) {
    return { error: 'Sinistro não encontrado' }
  }
  
  const channel = formData.get('channel') as string
  const summary = formData.get('summary') as string
  const next_contact_date = formData.get('next_contact_date') as string | null
  
  // Validações
  if (!channel) {
    return { error: 'Canal de comunicação é obrigatório' }
  }
  if (!summary || summary.length < 5) {
    return { error: 'Resumo deve ter pelo menos 5 caracteres' }
  }
  
  const { error } = await supabase
    .from('claim_communications')
    .insert({
      claim_details_id: ticket.id,
      channel,
      summary,
      next_contact_date: next_contact_date || null,
      created_by: user.id,
    })
  
  if (error) {
    console.error('Error adding communication:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

// ============================================
// Comment Functions
// ============================================

/**
 * Adiciona comentário ao sinistro
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
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

// ============================================
// Approval Functions
// ============================================

/**
 * Aprovar/Rejeitar sinistro
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
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  revalidatePath('/chamados/sinistros')
  return { success: true }
}

// ============================================
// Internal Purchases Functions (Fase 4)
// ============================================

/**
 * Item de compra para criação
 */
interface PurchaseItemInput {
  item_name: string
  description?: string
  quantity: number
  unit_of_measure?: string
  estimated_unit_price?: number
}

/**
 * Cria uma nova compra interna
 */
export async function createClaimPurchase(
  ticketId: string,
  data: {
    title: string
    description?: string
    due_date?: string
    items: PurchaseItemInput[]
  }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Validações
  if (!data.title || data.title.trim().length < 3) {
    return { error: 'Título deve ter pelo menos 3 caracteres' }
  }
  
  if (!data.items || data.items.length === 0) {
    return { error: 'A compra deve ter pelo menos 1 item' }
  }
  
  // Buscar claim_details_id
  const { data: claimDetails } = await supabase
    .from('ticket_claim_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .single()
  
  if (!claimDetails) {
    return { error: 'Sinistro não encontrado' }
  }
  
  // Calcular total estimado
  const estimatedTotal = data.items.reduce((total, item) => {
    const price = item.estimated_unit_price || 0
    return total + (price * item.quantity)
  }, 0)
  
  // Criar compra
  const { data: purchase, error: purchaseError } = await supabase
    .from('claim_purchases')
    .insert({
      claim_details_id: claimDetails.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      due_date: data.due_date || null,
      estimated_total: estimatedTotal || null,
      status: 'awaiting_quotation',
      created_by: user.id
    })
    .select('id')
    .single()
  
  if (purchaseError || !purchase) {
    console.error('Error creating purchase:', purchaseError)
    return { error: purchaseError?.message || 'Erro ao criar compra' }
  }
  
  // Criar itens da compra
  const itemsToInsert = data.items.map(item => ({
    claim_purchase_id: purchase.id,
    item_name: item.item_name.trim(),
    description: item.description?.trim() || null,
    quantity: item.quantity,
    unit_of_measure: item.unit_of_measure || 'un',
    estimated_unit_price: item.estimated_unit_price || null
  }))
  
  const { error: itemsError } = await supabase
    .from('claim_purchase_items')
    .insert(itemsToInsert)
  
  if (itemsError) {
    console.error('Error creating purchase items:', itemsError)
    // Rollback: deletar a compra criada
    await supabase.from('claim_purchases').delete().eq('id', purchase.id)
    return { error: itemsError.message }
  }
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: 'purchase_created',
    new_value: data.title,
    metadata: { purchase_id: purchase.id, items_count: data.items.length }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true, purchaseId: purchase.id }
}

/**
 * Adiciona item a uma compra existente
 */
export async function addClaimPurchaseItem(
  ticketId: string,
  purchaseId: string,
  item: PurchaseItemInput
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Validações
  if (!item.item_name || item.item_name.trim().length < 2) {
    return { error: 'Nome do item é obrigatório' }
  }
  
  if (!item.quantity || item.quantity < 1) {
    return { error: 'Quantidade deve ser maior que zero' }
  }
  
  // Verificar se a compra existe e pode ser editada
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select('id, status')
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  // Só pode adicionar itens se ainda não foi aprovada
  const editableStatuses = ['awaiting_quotation', 'quotations_received']
  if (!editableStatuses.includes(purchase.status)) {
    return { error: 'Não é possível adicionar itens a esta compra' }
  }
  
  // Criar item
  const { error } = await supabase
    .from('claim_purchase_items')
    .insert({
      claim_purchase_id: purchaseId,
      item_name: item.item_name.trim(),
      description: item.description?.trim() || null,
      quantity: item.quantity,
      unit_of_measure: item.unit_of_measure || 'un',
      estimated_unit_price: item.estimated_unit_price || null
    })
  
  if (error) {
    console.error('Error adding purchase item:', error)
    return { error: error.message }
  }
  
  // Atualizar total estimado da compra
  await updatePurchaseEstimatedTotal(purchaseId)
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

/**
 * Remove item de uma compra
 */
export async function removeClaimPurchaseItem(
  ticketId: string,
  purchaseId: string,
  itemId: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar se a compra pode ser editada
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select('id, status')
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  const editableStatuses = ['awaiting_quotation', 'quotations_received']
  if (!editableStatuses.includes(purchase.status)) {
    return { error: 'Não é possível remover itens desta compra' }
  }
  
  // Verificar se não é o último item
  const { count } = await supabase
    .from('claim_purchase_items')
    .select('id', { count: 'exact', head: true })
    .eq('claim_purchase_id', purchaseId)
  
  if (count && count <= 1) {
    return { error: 'A compra deve ter pelo menos 1 item' }
  }
  
  // Remover item
  const { error } = await supabase
    .from('claim_purchase_items')
    .delete()
    .eq('id', itemId)
    .eq('claim_purchase_id', purchaseId)
  
  if (error) {
    console.error('Error removing purchase item:', error)
    return { error: error.message }
  }
  
  // Atualizar total estimado
  await updatePurchaseEstimatedTotal(purchaseId)
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

/**
 * Busca compras internas de um sinistro
 */
export async function getClaimPurchases(ticketId: string) {
  const supabase = await createClient()
  
  // Buscar claim_details_id
  const { data: claimDetails } = await supabase
    .from('ticket_claim_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .single()
  
  if (!claimDetails) {
    return []
  }
  
  const { data: purchases, error } = await supabase
    .from('claim_purchases')
    .select(`
      *,
      assigned:profiles!assigned_to(id, full_name, avatar_url),
      approver:profiles!approved_by(id, full_name, avatar_url),
      creator:profiles!created_by(id, full_name, avatar_url),
      items:claim_purchase_items(*),
      quotations:claim_purchase_quotations(
        *,
        supplier:accredited_suppliers(id, name, cnpj, category),
        creator:profiles!created_by(id, full_name, avatar_url)
      )
    `)
    .eq('claim_details_id', claimDetails.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching purchases:', error)
    return []
  }
  
  return purchases || []
}

/**
 * Atualiza total estimado de uma compra (função auxiliar)
 */
async function updatePurchaseEstimatedTotal(purchaseId: string) {
  const supabase = await createClient()
  
  const { data: items } = await supabase
    .from('claim_purchase_items')
    .select('quantity, estimated_unit_price')
    .eq('claim_purchase_id', purchaseId)
  
  if (!items) return
  
  const total = items.reduce((sum, item) => {
    const price = item.estimated_unit_price || 0
    return sum + (Number(price) * item.quantity)
  }, 0)
  
  await supabase
    .from('claim_purchases')
    .update({ estimated_total: total || null })
    .eq('id', purchaseId)
}

// ============================================
// Quotation Functions (Fase 4)
// ============================================

/**
 * Adiciona cotação a uma compra
 */
export async function addClaimQuotation(
  ticketId: string,
  purchaseId: string,
  data: {
    supplier_id?: string
    supplier_name: string
    supplier_cnpj?: string
    supplier_contact?: string
    supplier_phone?: string
    total_price: number
    payment_terms?: string
    delivery_deadline?: string
    validity_date?: string
    notes?: string
    items_breakdown?: Record<string, unknown>
  }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Validações
  if (!data.supplier_name || data.supplier_name.trim().length < 2) {
    return { error: 'Nome do fornecedor é obrigatório' }
  }
  
  if (!data.total_price || data.total_price <= 0) {
    return { error: 'Preço total deve ser maior que zero' }
  }
  
  // Verificar se a compra existe
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select('id, status')
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  // Verificar se pode adicionar cotação
  const allowedStatuses = ['awaiting_quotation', 'quotations_received']
  if (!allowedStatuses.includes(purchase.status)) {
    return { error: 'Não é possível adicionar cotações a esta compra' }
  }
  
  // Criar cotação
  const { error } = await supabase
    .from('claim_purchase_quotations')
    .insert({
      claim_purchase_id: purchaseId,
      supplier_id: data.supplier_id || null,
      supplier_name: data.supplier_name.trim(),
      supplier_cnpj: data.supplier_cnpj?.trim() || null,
      supplier_contact: data.supplier_contact?.trim() || null,
      supplier_phone: data.supplier_phone?.trim() || null,
      total_price: data.total_price,
      payment_terms: data.payment_terms?.trim() || null,
      delivery_deadline: data.delivery_deadline || null,
      validity_date: data.validity_date || null,
      notes: data.notes?.trim() || null,
      items_breakdown: data.items_breakdown || null,
      status: 'pending',
      created_by: user.id
    })
  
  if (error) {
    console.error('Error adding quotation:', error)
    return { error: error.message }
  }
  
  // Atualizar status da compra se ainda estava aguardando cotação
  if (purchase.status === 'awaiting_quotation') {
    await supabase
      .from('claim_purchases')
      .update({ status: 'quotations_received' })
      .eq('id', purchaseId)
  }
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: 'quotation_added',
    new_value: data.supplier_name,
    metadata: { purchase_id: purchaseId, total_price: data.total_price }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

/**
 * Seleciona cotação vencedora
 */
export async function selectClaimQuotation(
  ticketId: string,
  purchaseId: string,
  quotationId: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar se a compra existe
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select('id, status')
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  // Verificar se pode selecionar cotação
  const allowedStatuses = ['quotations_received', 'awaiting_approval']
  if (!allowedStatuses.includes(purchase.status)) {
    return { error: 'Não é possível selecionar cotação neste status' }
  }
  
  // Verificar se a cotação existe
  const { data: quotation } = await supabase
    .from('claim_purchase_quotations')
    .select('id, total_price, supplier_name')
    .eq('id', quotationId)
    .eq('claim_purchase_id', purchaseId)
    .single()
  
  if (!quotation) {
    return { error: 'Cotação não encontrada' }
  }
  
  // Desmarcar cotações anteriores
  await supabase
    .from('claim_purchase_quotations')
    .update({ is_selected: false })
    .eq('claim_purchase_id', purchaseId)
  
  // Marcar cotação selecionada
  const { error: selectError } = await supabase
    .from('claim_purchase_quotations')
    .update({ is_selected: true })
    .eq('id', quotationId)
  
  if (selectError) {
    console.error('Error selecting quotation:', selectError)
    return { error: selectError.message }
  }
  
  // Atualizar compra com cotação selecionada
  await supabase
    .from('claim_purchases')
    .update({
      selected_quotation_id: quotationId,
      approved_total: quotation.total_price,
      status: 'awaiting_approval'
    })
    .eq('id', purchaseId)
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: 'quotation_selected',
    new_value: quotation.supplier_name,
    metadata: { purchase_id: purchaseId, quotation_id: quotationId, total_price: quotation.total_price }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

/**
 * Busca fornecedores credenciados
 */
export async function getAccreditedSuppliers(category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('accredited_suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
  
  return data || []
}

// ============================================
// Purchase Approval Functions (Fase 4)
// ============================================

/**
 * Aprova compra interna (apenas Gerente de Sinistros)
 */
export async function approveClaimPurchase(
  ticketId: string,
  purchaseId: string,
  decision: 'approved' | 'rejected',
  notes?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar permissão (apenas Gerente pode aprovar)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name, department:departments!department_id(name))
    `)
    .eq('user_id', user.id)
  
  const isManager = userRoles?.some(ur => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = ur.role as any
    const roleName = role?.name?.toLowerCase()
    const deptName = role?.department?.name?.toLowerCase()
    
    // Gerente de Sinistros ou Admin/Desenvolvedor
    return (
      roleName === 'gerente' && deptName === 'sinistros' ||
      roleName === 'administrador' ||
      roleName === 'desenvolvedor' ||
      roleName === 'diretor'
    )
  })
  
  if (!isManager) {
    return { error: 'Apenas o Gerente de Sinistros pode aprovar compras' }
  }
  
  // Buscar compra
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select(`
      id, 
      status, 
      title,
      selected_quotation_id,
      quotations:claim_purchase_quotations(id)
    `)
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  // Verificar se está aguardando aprovação
  if (purchase.status !== 'awaiting_approval') {
    return { error: 'Esta compra não está aguardando aprovação' }
  }
  
  // Verificar se tem cotação selecionada
  if (!purchase.selected_quotation_id) {
    return { error: 'Selecione uma cotação antes de aprovar' }
  }
  
  // Verificar mínimo de 2 cotações
  const quotationsCount = purchase.quotations?.length || 0
  if (quotationsCount < 2 && decision === 'approved') {
    return { error: 'São necessárias pelo menos 2 cotações para aprovar a compra' }
  }
  
  // Atualizar status da compra
  const newStatus = decision === 'approved' ? 'approved' : 'rejected'
  
  const { error } = await supabase
    .from('claim_purchases')
    .update({
      status: newStatus,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_reason: decision === 'rejected' ? (notes || 'Rejeitada pelo gerente') : null
    })
    .eq('id', purchaseId)
  
  if (error) {
    console.error('Error approving purchase:', error)
    return { error: error.message }
  }
  
  // Atualizar status das cotações
  if (decision === 'approved') {
    // Marcar cotação selecionada como aprovada
    await supabase
      .from('claim_purchase_quotations')
      .update({ status: 'approved' })
      .eq('id', purchase.selected_quotation_id)
    
    // Marcar outras como rejeitadas
    await supabase
      .from('claim_purchase_quotations')
      .update({ status: 'rejected' })
      .eq('claim_purchase_id', purchaseId)
      .neq('id', purchase.selected_quotation_id)
  }
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: decision === 'approved' ? 'purchase_approved' : 'purchase_rejected',
    new_value: purchase.title,
    metadata: { purchase_id: purchaseId, notes }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

/**
 * Atualiza status da compra (após aprovação)
 */
export async function updateClaimPurchaseStatus(
  ticketId: string,
  purchaseId: string,
  newStatus: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Status permitidos para atualização manual
  const allowedTransitions: Record<string, string[]> = {
    'approved': ['in_progress'],
    'in_progress': ['delivered'],
    'delivered': ['completed']
  }
  
  // Buscar compra atual
  const { data: purchase } = await supabase
    .from('claim_purchases')
    .select('id, status, title')
    .eq('id', purchaseId)
    .single()
  
  if (!purchase) {
    return { error: 'Compra não encontrada' }
  }
  
  // Verificar se transição é permitida
  const allowed = allowedTransitions[purchase.status] || []
  if (!allowed.includes(newStatus)) {
    return { error: 'Transição de status não permitida' }
  }
  
  // Atualizar status
  const updateData: Record<string, unknown> = { status: newStatus }
  
  if (newStatus === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('claim_purchases')
    .update(updateData)
    .eq('id', purchaseId)
  
  if (error) {
    console.error('Error updating purchase status:', error)
    return { error: error.message }
  }
  
  // Registrar no histórico
  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    user_id: user.id,
    action: 'purchase_status_changed',
    old_value: purchase.status,
    new_value: newStatus,
    metadata: { purchase_id: purchaseId, title: purchase.title }
  })
  
  revalidatePath(`/chamados/sinistros/${ticketId}`)
  return { success: true }
}

