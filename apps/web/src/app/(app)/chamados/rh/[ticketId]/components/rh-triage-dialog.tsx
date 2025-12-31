'use client'

import { useState, useTransition } from 'react'
import { format, addDays } from 'date-fns'
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
import { triageRHTicket } from '../../actions'

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface RHTriageDialogProps {
  ticketId: string
  ticketNumber: number
  ticketTitle: string
  perceivedUrgency?: string | null
  departmentMembers: DepartmentMember[]
  disabled?: boolean
}

const priorities = [
  { value: 'low', label: 'Baixa', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', description: 'Pode aguardar', suggestedDays: 14 },
  { value: 'medium', label: 'Média', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', description: 'Prazo moderado', suggestedDays: 7 },
  { value: 'high', label: 'Alta', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', description: 'Atencão prioritária', suggestedDays: 3 },
  { value: 'urgent', label: 'Urgente', icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', description: 'Ação imediata', suggestedDays: 1 },
]

const urgencyLabels: Record<string, { label: string; color: string }> = {
  'low': { label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  'high': { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function RHTriageDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  perceivedUrgency,
  departmentMembers,
  disabled = false
}: RHTriageDialogProps) {
  const [open, setOpen] = useState(false)
  const [priority, setPriority] = useState<string>('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    const priorityConfig = priorities.find(p => p.value === value)
    if (priorityConfig) {
      const suggestedDate = addDays(new Date(), priorityConfig.suggestedDays)
      setDueDate(format(suggestedDate, 'yyyy-MM-dd'))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!priority || !assignedTo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    
    const formData = new FormData()
    formData.set('priority', priority)
    formData.set('assigned_to', assignedTo)
    if (dueDate) formData.set('due_date', dueDate)
    
    startTransition(async () => {
      const result = await triageRHTicket(ticketId, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Chamado triado!')
        setOpen(false)
      }
    })
  }

  const selectedMember = departmentMembers.find(m => m.id === assignedTo)

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
            Triagem do Chamado de RH
          </DialogTitle>
          <DialogDescription>
            #{ticketNumber} - {ticketTitle}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label className="font-semibold">Prioridade *</Label>
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
                      isSelected ? cn(p.bgColor, p.borderColor) : 'border-border'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', p.color)} />
                    <div className="text-sm font-medium">{p.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-semibold">Responsável *</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {departmentMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <span>{member.full_name} ({member.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isPending}>Confirmar Triagem</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

