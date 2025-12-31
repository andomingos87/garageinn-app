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
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      unit:units(id, name, code),
      category:ticket_categories(id, name),
      creator:profiles!created_by(id, full_name, avatar_url, email),
      assignee:profiles!assigned_to(id, full_name, avatar_url, email),
      claim_details:ticket_claim_details(*)
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

