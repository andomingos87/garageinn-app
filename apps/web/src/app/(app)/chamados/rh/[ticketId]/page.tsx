import { notFound } from 'next/navigation'
import { getRHTicketDetails, canTriageRHTicket, getRHDepartmentMembers } from '../actions'
import {
  TicketHeader,
  TicketRHInfo,
  TicketTimeline,
  RHTicketComments,
  RHTicketApprovals,
  RHTicketActions,
} from './components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, History, CheckCircle2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{
    ticketId: string
  }>
}

export default async function DetalheChamadoRHPage({ params }: PageProps) {
  const { ticketId } = await params
  const supabase = await createClient()
  
  const [ticket, canTriage, rhMembers, { data: { user } }] = await Promise.all([
    getRHTicketDetails(ticketId),
    canTriageRHTicket(),
    getRHDepartmentMembers(),
    supabase.auth.getUser()
  ])

  if (!ticket) {
    notFound()
  }

  // Obter perfil do usuário logado para verificar cargo de aprovação
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        role:roles (
          name
        )
      )
    `)
    .eq('id', user?.id || '')
    .single()

  // Simplificamos pegando o primeiro cargo para aprovação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserRole = (profile as any)?.user_roles?.[0]?.role?.name

  const isAuthor = user?.id === ticket.created_by
  const canManage = canTriage || isAuthor

  return (
    <div className="space-y-6">
      {/* Header with Title, Status and Actions */}
      <TicketHeader ticket={ticket} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Info and Details */}
        <div className="lg:col-span-2 space-y-6">
          <TicketRHInfo ticket={ticket} />

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentários
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Aprovações
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Linha do Tempo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="mt-6">
              <RHTicketComments ticketId={ticket.id} comments={ticket.comments} canManage={canTriage} />
            </TabsContent>
            
            <TabsContent value="approvals" className="mt-6">
              <RHTicketApprovals 
                ticketId={ticket.id} 
                approvals={ticket.approvals} 
                ticketStatus={ticket.status}
                currentUserRole={currentUserRole}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              <TicketTimeline history={ticket.history} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sidebar Actions and Stats */}
        <div className="space-y-6">
          <RHTicketActions 
            ticket={ticket} 
            canManage={canManage}
            canTriage={canTriage}
            rhMembers={rhMembers}
          />
          
          <div className="rounded-lg border bg-card p-4 space-y-4 text-sm">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Solicitante
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{ticket.created_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidade:</span>
                <span className="font-medium">{ticket.unit_name || 'Global'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
