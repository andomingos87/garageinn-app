'use client'

import { useState, useTransition } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Ban,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { changeRHTicketStatus } from '../../actions'
import { RHTriageDialog } from './rh-triage-dialog'
import { UniformDeliveryDialog } from './uniform-delivery-dialog'

interface RHMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface RHTicketActionsProps {
  ticket: any
  canManage: boolean
  canTriage: boolean
  rhMembers: RHMember[]
}

const statusLabels: Record<string, string> = {
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  'awaiting_triage': 'Aguardando Triagem',
  'in_progress': 'Em Andamento',
  'resolved': 'Resolvido',
  'closed': 'Fechado',
  'denied': 'Negado',
  'cancelled': 'Cancelado'
}

const statusActions: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  'in_progress': { label: 'Iniciar Atendimento', icon: Play, variant: 'default' },
  'resolved': { label: 'Marcar como Resolvido', icon: CheckCircle, variant: 'secondary' },
  'closed': { label: 'Fechar Chamado', icon: CheckCircle, variant: 'default' },
  'denied': { label: 'Negar Chamado', icon: XCircle, variant: 'destructive' },
  'cancelled': { label: 'Cancelar Chamado', icon: Ban, variant: 'destructive' },
}

export function RHTicketActions({ 
  ticket,
  canManage,
  canTriage,
  rhMembers,
}: RHTicketActionsProps) {
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false)
  const [denyReason, setDenyReason] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const currentStatus = ticket.status
  const showTriageButton = currentStatus === 'awaiting_triage' && canTriage
  
  // Verificar se é chamado de uniforme
  const isUniformTicket = ticket.rh_details?.rh_type === 'uniform'
  const showUniformDelivery = isUniformTicket && currentStatus === 'in_progress' && canTriage
  
  // Lógica simplificada de transições para RH no MVP
  const allowedTransitions: string[] = []
  if (canManage) {
    // Se for uniforme, não mostrar botão de "resolvido" genérico (usar entrega de uniforme)
    if (currentStatus === 'in_progress' && !isUniformTicket) allowedTransitions.push('resolved')
    if (currentStatus === 'resolved') allowedTransitions.push('closed')
    if (['awaiting_triage', 'in_progress'].includes(currentStatus)) allowedTransitions.push('denied')
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'denied') {
      setIsDenyDialogOpen(true)
      return
    }
    
    startTransition(async () => {
      const result = await changeRHTicketStatus(ticket.id, newStatus)
      if (result.error) toast.error(result.error)
      else toast.success(`Status alterado para: ${statusLabels[newStatus]}`)
    })
  }

  const handleDeny = () => {
    if (!denyReason.trim()) {
      toast.error('Informe o motivo')
      return
    }
    startTransition(async () => {
      const result = await changeRHTicketStatus(ticket.id, 'denied', denyReason)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Chamado negado')
        setIsDenyDialogOpen(false)
      }
    })
  }

  if (!canManage && !showTriageButton) return null

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Chamado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {showTriageButton && (
            <RHTriageDialog
              ticketId={ticket.id}
              ticketNumber={ticket.ticket_number}
              ticketTitle={ticket.title}
              perceivedUrgency={ticket.perceived_urgency}
              departmentMembers={rhMembers}
            />
          )}
          
          {/* Botão especial de entrega de uniforme */}
          {showUniformDelivery && ticket.uniform && (
            <UniformDeliveryDialog
              ticketId={ticket.id}
              uniformName={ticket.uniform.name}
              uniformSize={ticket.uniform.size}
              quantity={ticket.rh_details?.specific_fields?.quantity || 1}
            />
          )}
          
          {allowedTransitions.map((status) => {
            const action = statusActions[status]
            if (!action) return null
            const Icon = action.icon
            return (
              <Button
                key={status}
                variant={action.variant}
                className="w-full gap-2"
                onClick={() => handleStatusChange(status)}
                disabled={isPending}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            )
          })}
        </CardContent>
      </Card>
      
      <Dialog open={isDenyDialogOpen} onOpenChange={setIsDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar Chamado</DialogTitle>
            <DialogDescription>Motivo da negação obrigatório.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Justificativa</Label>
            <Textarea 
              value={denyReason} 
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Explique o motivo..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDenyDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeny} disabled={isPending || !denyReason.trim()}>
              Confirmar Negação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

