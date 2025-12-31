'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, ExternalLink, Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { createMaintenanceFromClaim } from '../actions'

interface LinkedMaintenanceTicket {
  id: string
  ticket_number: number
  title: string
  status: string
  priority: string | null
  created_at: string
}

interface ClaimMaintenanceLinkProps {
  ticketId: string
  linkedTicket: LinkedMaintenanceTicket | null
  canCreate: boolean
  categoryName?: string | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'awaiting_triage': { label: 'Aguardando Triagem', variant: 'outline' },
  'awaiting_approval_encarregado': { label: 'Aguard. Aprovação', variant: 'outline' },
  'awaiting_approval_supervisor': { label: 'Aguard. Aprovação', variant: 'outline' },
  'awaiting_approval_gerente': { label: 'Aguard. Aprovação', variant: 'outline' },
  'in_progress': { label: 'Em Andamento', variant: 'default' },
  'resolved': { label: 'Resolvido', variant: 'secondary' },
  'closed': { label: 'Fechado', variant: 'secondary' },
  'cancelled': { label: 'Cancelado', variant: 'destructive' },
  'denied': { label: 'Negado', variant: 'destructive' },
}

export function ClaimMaintenanceLink({ 
  ticketId, 
  linkedTicket, 
  canCreate,
  categoryName 
}: ClaimMaintenanceLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Verificar se a categoria é elegível para gerar manutenção
  const eligibleCategories = ['estrutura', 'equipamento', 'instalações', 'infraestrutura']
  const isEligible = categoryName 
    ? eligibleCategories.some(cat => categoryName.toLowerCase().includes(cat))
    : true // Se não tem categoria, permite criar
  
  const handleCreateMaintenance = () => {
    startTransition(async () => {
      const result = await createMaintenanceFromClaim(ticketId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Chamado de Manutenção #${result.maintenanceTicketNumber} criado com sucesso!`)
        setIsDialogOpen(false)
      }
    })
  }
  
  // Se já tem chamado vinculado, mostrar informações
  if (linkedTicket) {
    const config = statusConfig[linkedTicket.status] || { label: linkedTicket.status, variant: 'outline' as const }
    
    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Wrench className="h-4 w-4" />
            Chamado de Manutenção Vinculado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">#{linkedTicket.ticket_number}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {linkedTicket.title}
                </p>
              </div>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => router.push(`/chamados/manutencao/${linkedTicket.id}`)}
            >
              <ExternalLink className="h-4 w-4" />
              Ver Chamado de Manutenção
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Se não pode criar ou não é elegível, não mostrar nada
  if (!canCreate) {
    return null
  }
  
  // Mostrar botão para criar chamado de manutenção
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Chamado de Manutenção
        </CardTitle>
        <CardDescription>
          {isEligible 
            ? 'Gere um chamado de manutenção para reparos necessários'
            : 'Disponível para sinistros de estrutura ou equipamento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              disabled={!isEligible}
            >
              <Plus className="h-4 w-4" />
              Gerar Chamado de Manutenção
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Gerar Chamado de Manutenção</AlertDialogTitle>
              <AlertDialogDescription>
                Será criado um novo chamado de manutenção vinculado a este sinistro. 
                Os dados do sinistro serão copiados automaticamente para o novo chamado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleCreateMaintenance()
                }}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

