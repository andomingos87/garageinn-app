import { notFound } from 'next/navigation'
import { Wrench, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getMaintenanceTicketById } from '../actions'
import { statusLabels, statusColors } from '../constants'

interface PageProps {
  params: Promise<{ ticketId: string }>
}

export default async function MaintenanceTicketDetailsPage({ params }: PageProps) {
  const { ticketId } = await params
  const ticket = await getMaintenanceTicketById(ticketId)
  
  if (!ticket) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chamados/manutencao">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Chamado #{ticket.ticket_number}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{ticket.title}</h2>
          </div>
        </div>
        <Badge className={statusColors[ticket.status] || 'bg-slate-500 text-white'}>
          {statusLabels[ticket.status] || ticket.status}
        </Badge>
      </div>

      {/* Ticket Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Chamado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={statusColors[ticket.status] || 'bg-slate-500 text-white'}>
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span>{ticket.category_name || 'Não definida'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidade:</span>
                <span>{ticket.unit_name || 'Não definida'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado por:</span>
                <span>{ticket.created_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de criação:</span>
                <span>{new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
              </div>
              {ticket.priority && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridade:</span>
                  <span className="capitalize">{ticket.priority}</span>
                </div>
              )}
              {ticket.assigned_to_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responsável:</span>
                  <span>{ticket.assigned_to_name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for full details - will be implemented in Task 4 */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Detalhes completos em desenvolvimento</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Timeline, comentários, anexos e ações serão implementados na Tarefa 4.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

