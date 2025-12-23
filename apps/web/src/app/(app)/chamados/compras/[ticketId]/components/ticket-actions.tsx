'use client'

import { useState, useTransition } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package,
  Star,
  ArrowRight,
  Ban,
  UserPlus,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  changeTicketStatus, 
  triageTicket 
} from '../../actions'

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface TicketActionsProps {
  ticketId: string
  currentStatus: string
  canManage: boolean
  departmentMembers: DepartmentMember[]
  allowedTransitions: string[]
}

// Labels para status
const statusLabels: Record<string, string> = {
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  'awaiting_triage': 'Aguardando Triagem',
  'in_progress': 'Em Andamento',
  'quoting': 'Em Cotação',
  'awaiting_approval': 'Aguardando Aprovação',
  'approved': 'Aprovado',
  'purchasing': 'Executando Compra',
  'in_delivery': 'Em Entrega',
  'delivered': 'Entrega Realizada',
  'evaluating': 'Em Avaliação',
  'closed': 'Fechado',
  'denied': 'Negado',
  'cancelled': 'Cancelado'
}

const statusActions: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'destructive' | 'outline' }> = {
  'in_progress': { label: 'Iniciar Andamento', icon: Play, variant: 'default' },
  'quoting': { label: 'Iniciar Cotação', icon: Package, variant: 'default' },
  'approved': { label: 'Aprovar', icon: CheckCircle, variant: 'default' },
  'purchasing': { label: 'Executar Compra', icon: ArrowRight, variant: 'default' },
  'in_delivery': { label: 'Enviar para Entrega', icon: Truck, variant: 'default' },
  'delivered': { label: 'Confirmar Entrega', icon: Package, variant: 'default' },
  'evaluating': { label: 'Avaliar Entrega', icon: Star, variant: 'default' },
  'closed': { label: 'Fechar Chamado', icon: CheckCircle, variant: 'default' },
  'denied': { label: 'Negar', icon: XCircle, variant: 'destructive' },
  'cancelled': { label: 'Cancelar', icon: Ban, variant: 'destructive' },
  'awaiting_triage': { label: 'Reenviar para Triagem', icon: ArrowRight, variant: 'outline' },
}

export function TicketActions({ 
  ticketId, 
  currentStatus, 
  canManage,
  departmentMembers,
  allowedTransitions
}: TicketActionsProps) {
  const [isTriageDialogOpen, setIsTriageDialogOpen] = useState(false)
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false)
  const [denyReason, setDenyReason] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const showTriageButton = currentStatus === 'awaiting_triage' && canManage
  
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
  
  const handleTriage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await triageTicket(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Chamado triado com sucesso')
        setIsTriageDialogOpen(false)
      }
    })
  }
  
  if (!canManage || (allowedTransitions.length === 0 && !showTriageButton)) {
    return null
  }
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Botão de Triagem */}
          {showTriageButton && (
            <Button
              className="w-full gap-2"
              onClick={() => setIsTriageDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Fazer Triagem
            </Button>
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
      
      {/* Dialog de Triagem */}
      <Dialog open={isTriageDialogOpen} onOpenChange={setIsTriageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Triagem do Chamado</DialogTitle>
            <DialogDescription>
              Defina a prioridade e atribua um responsável para este chamado.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTriage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
              <Select name="priority" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Responsável *</Label>
              <Select name="assigned_to" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {departmentMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.role || 'Membro'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date">Previsão de Conclusão</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTriageDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Confirmar Triagem'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
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
