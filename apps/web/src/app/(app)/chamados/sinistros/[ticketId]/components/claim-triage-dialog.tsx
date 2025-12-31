'use client'

import { useState, useTransition } from 'react'
import { 
  ClipboardCheck, 
  AlertTriangle, 
  User, 
  Calendar,
  Loader2,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { triageClaimTicket } from '../../actions'

interface DepartmentMember {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
}

interface ClaimTriageDialogProps {
  ticketId: string
  ticketNumber: number
  ticketTitle: string
  perceivedUrgency?: string | null
  occurrenceType?: string | null
  departmentMembers: DepartmentMember[]
  disabled?: boolean
}

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
]

const urgencyToPriority: Record<string, string> = {
  'baixa': 'low',
  'media': 'medium',
  'alta': 'high',
  'urgente': 'urgent',
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function ClaimTriageDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  perceivedUrgency,
  occurrenceType,
  departmentMembers,
  disabled = false
}: ClaimTriageDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Estado do formulário
  const [priority, setPriority] = useState(
    perceivedUrgency ? urgencyToPriority[perceivedUrgency.toLowerCase()] || 'medium' : 'medium'
  )
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  
  const selectedMember = departmentMembers.find(m => m.id === assignedTo)
  
  const handleSubmit = () => {
    const formData = new FormData()
    formData.set('priority', priority)
    formData.set('assigned_to', assignedTo)
    formData.set('due_date', dueDate)
    
    startTransition(async () => {
      const result = await triageClaimTicket(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Sinistro triado com sucesso!')
        setOpen(false)
      }
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2"
          disabled={disabled}
        >
          <ClipboardCheck className="h-4 w-4" />
          Triar Sinistro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Triagem de Sinistro
          </DialogTitle>
          <DialogDescription>
            Sinistro #{ticketNumber}: {ticketTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações do Sinistro */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Informações do Solicitante</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {perceivedUrgency && (
                <div>
                  <span className="text-muted-foreground">Urgência Percebida: </span>
                  <Badge variant="outline" className="ml-1 capitalize">
                    {perceivedUrgency}
                  </Badge>
                </div>
              )}
              {occurrenceType && (
                <div>
                  <span className="text-muted-foreground">Tipo: </span>
                  <span className="capitalize">{occurrenceType.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Prioridade *
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={option.color}>{option.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável
            </Label>
            <Select value={assignedTo || 'none'} onValueChange={(val) => setAssignedTo(val === 'none' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável">
                  {selectedMember && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedMember.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(selectedMember.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedMember.full_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Não atribuir agora</span>
                </SelectItem>
                {departmentMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Previsão de Conclusão */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Previsão de Conclusão
            </Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !priority}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              'Confirmar Triagem'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

