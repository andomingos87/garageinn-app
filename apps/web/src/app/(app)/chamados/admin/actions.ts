'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface DeleteTicketResult {
  success: boolean
  error?: string
  ticketNumber?: number
  attachmentPaths?: string[]
}

export interface TestTicket {
  id: string
  ticket_number: number
  title: string
  status: string
  department_name: string
  created_at: string
  created_by_name: string
}

// ============================================
// Verificação de Permissão
// ============================================

async function checkAdminPermission(): Promise<{ allowed: boolean; userId?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { allowed: false, error: 'Usuário não autenticado' }
  }
  
  // Verificar se usuário tem role admin ou desenvolvedor
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles(name)
    `)
    .eq('user_id', user.id)
  
  const hasAdminRole = userRoles?.some(ur => {
    // Supabase retorna array para relacionamentos, pegamos o primeiro item
    const roleData = ur.role as unknown
    const role = Array.isArray(roleData) ? roleData[0] : roleData
    return role?.name === 'Administrador' || role?.name === 'Desenvolvedor'
  })
  
  if (!hasAdminRole) {
    return { allowed: false, error: 'Permissão negada. Apenas Administrador ou Desenvolvedor podem deletar chamados.' }
  }
  
  return { allowed: true, userId: user.id }
}

// ============================================
// Query Functions
// ============================================

/**
 * Lista chamados que podem ser deletados (não fechados/resolvidos)
 * Para uso administrativo/testes
 */
export async function getTestTickets(): Promise<TestTicket[]> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    console.error(permission.error)
    return []
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      ticket_number,
      title,
      status,
      created_at,
      department:departments(name),
      created_by_profile:profiles!tickets_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('Error fetching test tickets:', error)
    return []
  }
  
  return (data || []).map(t => {
    // Supabase retorna arrays para relacionamentos, pegamos o primeiro item
    const deptData = t.department as unknown
    const dept = Array.isArray(deptData) ? deptData[0] : deptData
    const profileData = t.created_by_profile as unknown
    const profile = Array.isArray(profileData) ? profileData[0] : profileData
    
    return {
      id: t.id,
      ticket_number: t.ticket_number,
      title: t.title,
      status: t.status,
      department_name: dept?.name || 'N/A',
      created_at: t.created_at || '',
      created_by_name: profile?.full_name || 'N/A'
    }
  })
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Deleta um chamado e todas suas dependências
 * ATENÇÃO: Esta é uma operação destrutiva e irreversível
 */
export async function deleteTicket(ticketId: string): Promise<DeleteTicketResult> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    return { success: false, error: permission.error }
  }
  
  const supabase = await createClient()
  
  // Chamar função SQL que faz a deleção em cascata
  const { data, error } = await supabase.rpc('delete_ticket_cascade', {
    p_ticket_id: ticketId,
    p_deleted_by: permission.userId
  })
  
  if (error) {
    console.error('Error deleting ticket:', error)
    return { success: false, error: error.message }
  }
  
  const result = data as { success: boolean; error?: string; ticket_number?: number; attachment_paths?: string[] }
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  // TODO: Deletar arquivos do storage se houver anexos
  // if (result.attachment_paths?.length) {
  //   await supabase.storage.from('ticket-attachments').remove(result.attachment_paths)
  // }
  
  // Revalidar caches
  revalidatePath('/chamados')
  revalidatePath('/chamados/compras')
  revalidatePath('/chamados/manutencao')
  revalidatePath('/chamados/sinistros')
  revalidatePath('/chamados/rh')
  
  return {
    success: true,
    ticketNumber: result.ticket_number,
    attachmentPaths: result.attachment_paths
  }
}

/**
 * Deleta múltiplos chamados de uma vez
 */
export async function deleteMultipleTickets(ticketIds: string[]): Promise<{
  success: boolean
  deleted: number
  failed: number
  errors: string[]
}> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    return { success: false, deleted: 0, failed: ticketIds.length, errors: [permission.error!] }
  }
  
  let deleted = 0
  let failed = 0
  const errors: string[] = []
  
  for (const ticketId of ticketIds) {
    const result = await deleteTicket(ticketId)
    if (result.success) {
      deleted++
    } else {
      failed++
      errors.push(`Ticket ${ticketId}: ${result.error}`)
    }
  }
  
  return {
    success: failed === 0,
    deleted,
    failed,
    errors
  }
}
