'use client'

import { useState, useTransition } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Package,
  Star,
  ArrowRight,
  Ban,
  Settings,
  Wrench,
  Clock
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
import { changeTicketStatus } from '../../actions'
import { TriageDialog } from './triage-dialog'

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface TicketActionsProps {
  ticketId: string
  ticketNumber: number
  ticketTitle: string
  currentStatus: string
  canManage: boolean
  canTriage: boolean
  departmentMembers: DepartmentMember[]
  allowedTransitions: string[]
  perceivedUrgency?: string | null
  maintenanceType?: string | null
  locationDescription?: string | null
}

// Labels para status
const statusLabels: Record<string, string> = {
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  'awaiting_triage': 'Aguardando Triagem',
  'in_progress': 'Em Andamento',
  'technical_analysis': 'Em Análise Técnica',
  'awaiting_approval': 'Aguardando Aprovação',
  'approved': 'Aprovado',
  'executing': 'Executando Manutenção',
  'waiting_parts': 'Aguardando Peças/Materiais',
  'completed': 'Concluído',
  'evaluating': 'Em Avaliação',
  'closed': 'Fechado',
  'denied': 'Negado',
  'cancelled': 'Cancelado'
}

const statusActions: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' }> = {
  'in_progress': { label: 'Iniciar Andamento', icon: Play, variant: 'default' },
  'technical_analysis': { label: 'Enviar para Análise Técnica', icon: Settings, variant: 'default' },
  'awaiting_approval': { label: 'Enviar para Aprovação', icon: ArrowRight, variant: 'default' },
  'approved': { label: 'Aprovar', icon: CheckCircle, variant: 'default' },
  'executing': { label: 'Iniciar Execução', icon: Wrench, variant: 'default' },
  'waiting_parts': { label: 'Aguardando Peças', icon: Package, variant: 'outline' },
  'completed': { label: 'Marcar como Concluído', icon: CheckCircle, variant: 'default' },
  'evaluating': { label: 'Enviar para Avaliação', icon: Star, variant: 'default' },
  'closed': { label: 'Fechar Chamado', icon: CheckCircle, variant: 'default' },
  'denied': { label: 'Negar', icon: XCircle, variant: 'destructive' },
  'cancelled': { label: 'Cancelar', icon: Ban, variant: 'destructive' },
  'awaiting_triage': { label: 'Reenviar para Triagem', icon: Clock, variant: 'outline' },
}

export function TicketActions({ 
  ticketId,
  ticketNumber,
  ticketTitle,
  currentStatus, 
  canManage,
  canTriage,
  departmentMembers,
  allowedTransitions,
  perceivedUrgency,
  maintenanceType,
  locationDescription
}: TicketActionsProps) {
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false)
  const [denyReason, setDenyReason] = useState('')
  const [isPending, startTransition] = useTransition()
  
  // Mostrar botão de triagem apenas se status é awaiting_triage e usuário pode triar
  const showTriageButton = currentStatus === 'awaiting_triage' && canTriage
  
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'denied') {
      setIsDenyDialogOpen(true)
      return
    }
    
    startTransition(async () => {
      const result = await changeTicketStatus(ticketId, newStatus)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Status alterado para: ${statusLabels[newStatus]}`)
      }
    })
  }
  
  const handleDeny = () => {
    if (!denyReason.trim()) {
      toast.error('Informe o motivo da negação')
      return
    }
    
    startTransition(async () => {
      const result = await changeTicketStatus(ticketId, 'denied', denyReason)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Chamado negado')
        setIsDenyDialogOpen(false)
        setDenyReason('')
      }
    })
  }
  
  // Não mostrar card se não há ações disponíveis
  if (!canManage || (allowedTransitions.length === 0 && !showTriageButton)) {
    return null
  }
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Botão de Triagem */}
          {showTriageButton && (
            <TriageDialog
              ticketId={ticketId}
              ticketNumber={ticketNumber}
              ticketTitle={ticketTitle}
              perceivedUrgency={perceivedUrgency}
              departmentMembers={departmentMembers}
              maintenanceType={maintenanceType}
              locationDescription={locationDescription}
              disabled={isPending}
            />
          )}
          
          {/* Botões de Transição de Status */}
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
      
      {/* Dialog de Negação */}
      <Dialog open={isDenyDialogOpen} onOpenChange={setIsDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar Chamado</DialogTitle>
            <DialogDescription>
              Informe o motivo da negação. Esta informação será visível para o solicitante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deny_reason">Motivo da Negação *</Label>
              <Textarea
                id="deny_reason"
                placeholder="Explique o motivo da negação..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDenyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeny}
              disabled={isPending || !denyReason.trim()}
            >
              {isPending ? 'Processando...' : 'Confirmar Negação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

