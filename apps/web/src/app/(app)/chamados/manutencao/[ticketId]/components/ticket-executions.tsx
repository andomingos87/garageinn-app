'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Wrench, 
  Plus, 
  User, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ExecutionDialog } from './execution-dialog'
import { startExecution, completeExecution, setWaitingParts } from '../../actions'
import { EXECUTION_STATUS } from '../../constants'

interface Execution {
  id: string
  ticket_id: string
  description: string
  materials_needed: string | null
  start_date: string | null
  estimated_end_date: string | null
  actual_end_date: string | null
  estimated_cost: number | null
  actual_cost: number | null
  supplier_name: string | null
  supplier_contact: string | null
  status: string
  notes: string | null
  created_at: string
  assigned_user: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  unit: {
    id: string
    name: string
    code: string
  } | null
}

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface Unit {
  id: string
  name: string
  code: string
}

interface TicketExecutionsProps {
  ticketId: string
  executions: Execution[]
  canManage: boolean
  departmentMembers: DepartmentMember[]
  units: Unit[]
  ticketStatus: string
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  in_progress: { icon: PlayCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  waiting_parts: { icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

export function TicketExecutions({ 
  ticketId, 
  executions, 
  canManage,
  departmentMembers,
  units,
  ticketStatus
}: TicketExecutionsProps) {
  const [isAddingExecution, setIsAddingExecution] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy')
  }
  
  const handleStartExecution = (executionId: string) => {
    startTransition(async () => {
      const result = await startExecution(executionId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Execução iniciada')
      }
    })
  }
  
  const handleSetWaitingParts = (executionId: string) => {
    startTransition(async () => {
      const result = await setWaitingParts(ticketId, executionId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Marcado como aguardando peças/materiais')
      }
    })
  }
  
  const handleCompleteExecution = (executionId: string) => {
    const formData = new FormData()
    // Por enquanto, sem custo final obrigatório
    startTransition(async () => {
      const result = await completeExecution(executionId, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Execução concluída')
      }
    })
  }
  
  // Permitir adicionar execução apenas em determinados status
  const canAddExecution = canManage && ['in_progress', 'technical_analysis', 'approved', 'executing', 'waiting_parts'].includes(ticketStatus)
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Execuções de Manutenção
            {executions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {executions.length}
              </Badge>
            )}
          </CardTitle>
          {canAddExecution && (
            <Button 
              size="sm" 
              variant="outline"
              className="gap-1"
              onClick={() => setIsAddingExecution(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma execução registrada</p>
            {canAddExecution && (
              <p className="text-xs mt-1">Clique em &quot;Adicionar&quot; para registrar uma execução</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {executions.map((execution) => {
              const config = statusConfig[execution.status] || statusConfig.pending
              const StatusIcon = config.icon
              
              return (
                <div 
                  key={execution.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${config.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className={config.color}>
                          {EXECUTION_STATUS[execution.status as keyof typeof EXECUTION_STATUS] || execution.status}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(execution.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  {/* Descrição */}
                  <p className="text-sm">{execution.description}</p>
                  
                  {/* Detalhes em grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {/* Responsável */}
                    <div className="flex items-center gap-2">
                      {execution.assigned_user ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={execution.assigned_user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(execution.assigned_user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Responsável</p>
                            <p className="text-xs font-medium truncate">{execution.assigned_user.full_name}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-6 w-6 p-1 bg-muted rounded-full" />
                          <div>
                            <p className="text-xs">Responsável</p>
                            <p className="text-xs">Não definido</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Unidade */}
                    {execution.unit && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 p-1 bg-muted rounded-full text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Unidade</p>
                          <p className="text-xs font-medium truncate">{execution.unit.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Datas */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-6 w-6 p-1 bg-muted rounded-full text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Previsão</p>
                        <p className="text-xs font-medium">{formatDate(execution.estimated_end_date)}</p>
                      </div>
                    </div>
                    
                    {/* Custo */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-6 w-6 p-1 bg-muted rounded-full text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Custo Est.</p>
                        <p className="text-xs font-medium">{formatCurrency(execution.estimated_cost)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Materiais */}
                  {execution.materials_needed && (
                    <div className="text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Materiais:
                      </span>
                      <p className="mt-1 text-xs bg-muted/50 p-2 rounded">{execution.materials_needed}</p>
                    </div>
                  )}
                  
                  {/* Fornecedor */}
                  {execution.supplier_name && (
                    <div className="text-xs text-muted-foreground">
                      Fornecedor: {execution.supplier_name}
                      {execution.supplier_contact && ` (${execution.supplier_contact})`}
                    </div>
                  )}
                  
                  {/* Notas */}
                  {execution.notes && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      {execution.notes}
                    </div>
                  )}
                  
                  {/* Ações */}
                  {canManage && execution.status !== 'completed' && execution.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-2 border-t">
                      {execution.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartExecution(execution.id)}
                          disabled={isPending}
                          className="gap-1"
                        >
                          <PlayCircle className="h-3 w-3" />
                          Iniciar
                        </Button>
                      )}
                      {execution.status === 'in_progress' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSetWaitingParts(execution.id)}
                            disabled={isPending}
                            className="gap-1"
                          >
                            <Package className="h-3 w-3" />
                            Aguardar Peças
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCompleteExecution(execution.id)}
                            disabled={isPending}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Concluir
                          </Button>
                        </>
                      )}
                      {execution.status === 'waiting_parts' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartExecution(execution.id)}
                            disabled={isPending}
                            className="gap-1"
                          >
                            <PlayCircle className="h-3 w-3" />
                            Retomar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCompleteExecution(execution.id)}
                            disabled={isPending}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Concluir
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Resultado (se concluído) */}
                  {execution.status === 'completed' && (
                    <div className="flex gap-4 pt-2 border-t text-xs">
                      {execution.actual_end_date && (
                        <span className="text-muted-foreground">
                          Concluído em: {formatDate(execution.actual_end_date)}
                        </span>
                      )}
                      {execution.actual_cost && (
                        <span className="text-muted-foreground">
                          Custo final: {formatCurrency(execution.actual_cost)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      
      {/* Dialog para adicionar execução */}
      <ExecutionDialog
        ticketId={ticketId}
        open={isAddingExecution}
        onOpenChange={setIsAddingExecution}
        departmentMembers={departmentMembers}
        units={units}
      />
    </Card>
  )
}

