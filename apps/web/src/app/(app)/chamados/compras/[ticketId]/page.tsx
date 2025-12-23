import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { 
  getTicketDetails, 
  canManageTicket, 
  canTriageTicket,
  getComprasDepartmentMembers,
  getCurrentUser
} from '../actions'
import { getAllowedTransitions } from '../constants'
import {
  TicketHeader,
  TicketInfo,
  TicketTimeline,
  TicketComments,
  TicketQuotations,
  TicketApprovals,
  TicketActions
} from './components'

interface PageProps {
  params: Promise<{ ticketId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticketId } = await params
  const ticket = await getTicketDetails(ticketId)
  
  if (!ticket) {
    return { title: 'Chamado não encontrado' }
  }
  
  return {
    title: `#${ticket.ticket_number} - ${ticket.title} | Chamados de Compras`,
    description: ticket.description?.slice(0, 160)
  }
}

export default async function TicketDetailsPage({ params }: PageProps) {
  const { ticketId } = await params
  
  // Buscar dados em paralelo
  const [ticket, canManage, canTriage, departmentMembers, currentUser] = await Promise.all([
    getTicketDetails(ticketId),
    canManageTicket(ticketId),
    canTriageTicket(),
    getComprasDepartmentMembers(),
    getCurrentUser()
  ])
  
  if (!ticket) {
    notFound()
  }
  
  // Determinar o cargo do usuário atual (para aprovações)
  const currentUserRole = currentUser?.id ? await getUserRole(currentUser.id) : undefined
  
  // Obter transições permitidas para o status atual
  const allowedTransitions = getAllowedTransitions(ticket.status)
  
  // Verificar se tem aprovações pendentes (para mostrar a seção de aprovações)
  const hasApprovals = ticket.approvals && ticket.approvals.length > 0
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <TicketHeader ticket={ticket} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Item e Justificativa */}
          <TicketInfo ticket={ticket} />
          
          {/* Aprovações (se existirem) */}
          {hasApprovals && (
            <TicketApprovals
              ticketId={ticketId}
              approvals={ticket.approvals}
              ticketStatus={ticket.status}
              currentUserRole={currentUserRole}
            />
          )}
          
          {/* Cotações */}
          <TicketQuotations
            ticketId={ticketId}
            quotations={ticket.quotations}
            canManage={canManage}
            ticketStatus={ticket.status}
            itemQuantity={ticket.quantity}
          />
          
          {/* Comentários */}
          <TicketComments
            ticketId={ticketId}
            comments={ticket.comments}
            canManage={canManage}
          />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ações */}
          <TicketActions
            ticketId={ticketId}
            ticketNumber={ticket.ticket_number}
            ticketTitle={ticket.title}
            currentStatus={ticket.status}
            canManage={canManage}
            canTriage={canTriage}
            departmentMembers={departmentMembers}
            allowedTransitions={allowedTransitions}
            perceivedUrgency={ticket.perceived_urgency}
            itemName={ticket.item_name}
            quantity={ticket.quantity}
          />
          
          {/* Timeline / Histórico */}
          <TicketTimeline history={ticket.history} />
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para obter o cargo do usuário
async function getUserRole(userId: string): Promise<string | undefined> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name)
    `)
    .eq('user_id', userId)
    .limit(1)
    .single()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data?.role as any)?.name
}

