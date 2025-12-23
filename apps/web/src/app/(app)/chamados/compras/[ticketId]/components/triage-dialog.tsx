'use client'

import { useState, useTransition } from 'react'
import { format, addDays, addWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  UserPlus, 
  Calendar,
  AlertTriangle,
  AlertCircle,
  Clock,
  Zap,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { triageTicket } from '../../actions'

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface TriageDialogProps {
  ticketId: string
  ticketNumber: number
  ticketTitle: string
  perceivedUrgency?: string | null
  departmentMembers: DepartmentMember[]
  itemName?: string
  quantity?: number
  disabled?: boolean
}

// Configuração das prioridades
const priorities = [
  { 
    value: 'low', 
    label: 'Baixa', 
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Pode aguardar, sem urgência',
    suggestedDays: 14
  },
  { 
    value: 'medium', 
    label: 'Média', 
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Prazo moderado',
    suggestedDays: 7
  },
  { 
    value: 'high', 
    label: 'Alta', 
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Precisa de atenção prioritária',
    suggestedDays: 3
  },
  { 
    value: 'urgent', 
    label: 'Urgente', 
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Ação imediata necessária',
    suggestedDays: 1
  },
]

// Labels de urgência percebida
const urgencyLabels: Record<string, { label: string; color: string }> = {
  'low': { label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  'high': { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TriageDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  perceivedUrgency,
  departmentMembers,
  itemName,
  quantity,
  disabled = false
}: TriageDialogProps) {
  const [open, setOpen] = useState(false)
  const [priority, setPriority] = useState<string>('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  // Atualiza a data sugerida quando a prioridade muda
  const handlePriorityChange = (value: string) => {
    setPriority(value)
    
    // Sugerir data baseada na prioridade
    const priorityConfig = priorities.find(p => p.value === value)
    if (priorityConfig) {
      const suggestedDate = addDays(new Date(), priorityConfig.suggestedDays)
      setDueDate(format(suggestedDate, 'yyyy-MM-dd'))
    }
  }

  // Define atalhos de data
  const setQuickDate = (days: number) => {
    const date = addDays(new Date(), days)
    setDueDate(format(date, 'yyyy-MM-dd'))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!priority) {
      toast.error('Selecione a prioridade')
      return
    }
    
    if (!assignedTo) {
      toast.error('Selecione o responsável')
      return
    }
    
    const formData = new FormData()
    formData.set('priority', priority)
    formData.set('assigned_to', assignedTo)
    if (dueDate) {
      formData.set('due_date', dueDate)
    }
    
    startTransition(async () => {
      const result = await triageTicket(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Chamado triado com sucesso!')
        setOpen(false)
        // Limpar estado
        setPriority('')
        setAssignedTo('')
        setDueDate('')
      }
    })
  }

  const selectedMember = departmentMembers.find(m => m.id === assignedTo)
  const selectedPriority = priorities.find(p => p.value === priority)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" disabled={disabled}>
          <UserPlus className="h-4 w-4" />
          Fazer Triagem
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Triagem do Chamado
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">
              #{ticketNumber}
            </span>
            {' - '}
            {ticketTitle}
          </DialogDescription>
        </DialogHeader>
        
        {/* Resumo do Item */}
        {(itemName || quantity) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="font-medium text-muted-foreground mb-1">Item Solicitado:</div>
            <div className="text-foreground">
              {quantity && <span className="font-medium">{quantity}x</span>} {itemName}
            </div>
            {perceivedUrgency && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Urgência informada:</span>
                <Badge variant="outline" className={urgencyLabels[perceivedUrgency]?.color}>
                  {urgencyLabels[perceivedUrgency]?.label || perceivedUrgency}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prioridade */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Prioridade <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((p) => {
                const Icon = p.icon
                const isSelected = priority === p.value
                
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePriorityChange(p.value)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected 
                        ? cn(p.bgColor, p.borderColor, 'ring-2 ring-offset-1', `ring-${p.color.replace('text-', '')}`)
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', p.color)} />
                    <div>
                      <div className={cn('font-medium', isSelected && p.color)}>
                        {p.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to" className="text-base font-semibold">
              Responsável <span className="text-destructive">*</span>
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="h-auto py-2">
                <SelectValue placeholder="Selecione o responsável">
                  {selectedMember && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedMember.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedMember.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedMember.full_name}</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        {selectedMember.role}
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departmentMembers.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">
                    Nenhum membro encontrado no departamento
                  </div>
                ) : (
                  departmentMembers.map((member) => (
                    <SelectItem 
                      key={member.id} 
                      value={member.id}
                      className="py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{member.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {member.role || 'Membro'}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Previsão de Conclusão */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Previsão de Conclusão
            </Label>
            <div className="flex gap-2">
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="flex-1"
              />
            </div>
            {/* Atalhos de data */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
                className="text-xs"
              >
                Amanhã
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(3)}
                className="text-xs"
              >
                3 dias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(7)}
                className="text-xs"
              >
                1 semana
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(14)}
                className="text-xs"
              >
                2 semanas
              </Button>
            </div>
            {dueDate && (
              <p className="text-xs text-muted-foreground">
                Previsão: {format(new Date(dueDate + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            )}
          </div>
          
          {/* Resumo da Triagem */}
          {(priority || assignedTo) && (
            <div className="bg-primary/5 rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium text-primary">Resumo da Triagem:</div>
              <div className="text-sm space-y-1">
                {selectedPriority && (
                  <div className="flex items-center gap-2">
                    <selectedPriority.icon className={cn('h-4 w-4', selectedPriority.color)} />
                    <span>Prioridade: <strong>{selectedPriority.label}</strong></span>
                  </div>
                )}
                {selectedMember && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Responsável: <strong>{selectedMember.full_name}</strong></span>
                  </div>
                )}
                {dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Previsão: <strong>
                        {format(new Date(dueDate + 'T12:00:00'), 'dd/MM/yyyy')}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !priority || !assignedTo}
            >
              {isPending ? 'Salvando...' : 'Confirmar Triagem'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

