'use client'

import { useState, useTransition } from 'react'
import { 
  ChevronRight, 
  ArrowRight, 
  XCircle, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Clock,
  Search,
  User,
  FileText,
  Wrench,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { changeClaimStatus } from '../../actions'
import { statusTransitions, statusLabels } from '../../constants'

interface ClaimStatusActionsProps {
  ticketId: string
  currentStatus: string
  canManage: boolean
}

// Ícones para cada status
const statusIcons: Record<string, React.ElementType> = {
  'awaiting_triage': Clock,
  'in_analysis': Search,
  'in_investigation': Search,
  'awaiting_customer': User,
  'awaiting_quotations': FileText,
  'in_repair': Wrench,
  'awaiting_payment': CreditCard,
  'resolved': CheckCircle2,
  'denied': XCircle,
  'closed': CheckCircle2,
}

// Cores para cada status
const statusColors: Record<string, string> = {
  'awaiting_triage': 'text-amber-600',
  'in_analysis': 'text-blue-600',
  'in_investigation': 'text-purple-600',
  'awaiting_customer': 'text-orange-600',
  'awaiting_quotations': 'text-cyan-600',
  'in_repair': 'text-indigo-600',
  'awaiting_payment': 'text-pink-600',
  'resolved': 'text-green-600',
  'denied': 'text-red-600',
  'closed': 'text-gray-600',
}

export function ClaimStatusActions({ 
  ticketId, 
  currentStatus, 
  canManage 
}: ClaimStatusActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Obter transições permitidas
  const allowedTransitions = statusTransitions[currentStatus] || []
  
  // Se não pode gerenciar ou não há transições, não mostrar nada
  if (!canManage || allowedTransitions.length === 0) {
    return null
  }
  
  const handleStatusChange = (newStatus: string) => {
    // Se for negação, abrir dialog para motivo
    if (newStatus === 'denied') {
      setSelectedStatus(newStatus)
      setReason('')
      setIsDialogOpen(true)
      return
    }
    
    // Executar mudança direta
    startTransition(async () => {
      const result = await changeClaimStatus(ticketId, newStatus)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Status alterado para ${statusLabels[newStatus]}`)
      }
    })
  }
  
  const handleConfirmDenial = () => {
    if (!selectedStatus || !reason.trim()) return
    
    startTransition(async () => {
      const result = await changeClaimStatus(ticketId, selectedStatus, reason)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Sinistro negado')
        setIsDialogOpen(false)
        setSelectedStatus(null)
        setReason('')
      }
    })
  }
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedStatus(null)
    setReason('')
  }
  
  // Separar transições normais das de negação
  const normalTransitions = allowedTransitions.filter(s => s !== 'denied')
  const canDeny = allowedTransitions.includes('denied')
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Ações de Status
          </CardTitle>
          <CardDescription>
            Avançar ou alterar o status do sinistro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Dropdown com transições normais */}
          {normalTransitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Alterar Status
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {normalTransitions.map((status) => {
                  const Icon = statusIcons[status] || ArrowRight
                  const color = statusColors[status] || 'text-foreground'
                  
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="gap-2"
                    >
                      <Icon className={`h-4 w-4 ${color}`} />
                      {statusLabels[status] || status}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Botão de negar separado */}
          {canDeny && (
            <>
              {normalTransitions.length > 0 && <DropdownMenuSeparator className="my-2" />}
              <Button
                variant="outline"
                className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleStatusChange('denied')}
                disabled={isPending}
              >
                <XCircle className="h-4 w-4" />
                Negar Sinistro
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para motivo de negação */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Negar Sinistro
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da negação. Esta ação pode ser revertida posteriormente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Motivo da Negação *
              </label>
              <Textarea
                placeholder="Descreva o motivo pelo qual este sinistro está sendo negado..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDenial}
              disabled={isPending || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                'Confirmar Negação'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

