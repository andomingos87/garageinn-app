import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ ticketId: string }>
}

export default async function TicketRedirectPage({ params }: PageProps) {
  const { ticketId } = await params
  const supabase = await createClient()
  
  // Primeiro, buscar apenas o ticket para verificar se existe
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id, department_id')
    .eq('id', ticketId)
    .single()
  
  if (ticketError || !ticket) {
    notFound()
  }
  
  // Buscar o nome do departamento
  const { data: department } = await supabase
    .from('departments')
    .select('name')
    .eq('id', ticket.department_id)
    .single()
  
  const departmentName = department?.name
  
  // Verificar pelo tipo de detalhe (mais preciso)
  // Buscar detalhes de compras
  const { data: purchaseDetails } = await supabase
    .from('ticket_purchase_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .limit(1)
  
  if (purchaseDetails && purchaseDetails.length > 0) {
    redirect(`/chamados/compras/${ticketId}`)
  }
  
  // Buscar detalhes de manutenção
  const { data: maintenanceDetails } = await supabase
    .from('ticket_maintenance_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .limit(1)
  
  if (maintenanceDetails && maintenanceDetails.length > 0) {
    redirect(`/chamados/manutencao/${ticketId}`)
  }
  
  // Buscar detalhes de RH
  const { data: rhDetails } = await supabase
    .from('ticket_rh_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .limit(1)
  
  if (rhDetails && rhDetails.length > 0) {
    redirect(`/chamados/rh/${ticketId}`)
  }
  
  // Buscar detalhes de sinistros
  const { data: claimDetails } = await supabase
    .from('ticket_claim_details')
    .select('id')
    .eq('ticket_id', ticketId)
    .limit(1)
  
  if (claimDetails && claimDetails.length > 0) {
    redirect(`/chamados/sinistros/${ticketId}`)
  }
  
  // Fallback pelo nome do departamento
  switch (departmentName) {
    case 'Compras e Manutenção':
      // Default para compras se não tem detalhes específicos
      redirect(`/chamados/compras/${ticketId}`)
    case 'RH':
      redirect(`/chamados/rh/${ticketId}`)
    case 'Sinistros':
      redirect(`/chamados/sinistros/${ticketId}`)
    default:
      // Se não conseguir determinar, vai para compras como fallback
      redirect(`/chamados/compras/${ticketId}`)
  }
}
