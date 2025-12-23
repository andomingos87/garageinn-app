'use client'

import { useState, useTransition } from 'react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Plus, 
  User, 
  Calendar,
  DollarSign,
  Package,
  Building2,
  FileText,
  Truck
} from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { addExecution } from '../../actions'

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

interface ExecutionDialogProps {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentMembers: DepartmentMember[]
  units: Unit[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ExecutionDialog({
  ticketId,
  open,
  onOpenChange,
  departmentMembers,
  units
}: ExecutionDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [unitId, setUnitId] = useState('')
  const [materialsNeeded, setMaterialsNeeded] = useState('')
  const [startDate, setStartDate] = useState('')
  const [estimatedEndDate, setEstimatedEndDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierContact, setSupplierContact] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setDescription('')
    setAssignedTo('')
    setUnitId('')
    setMaterialsNeeded('')
    setStartDate('')
    setEstimatedEndDate('')
    setEstimatedCost('')
    setSupplierName('')
    setSupplierContact('')
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!description || description.trim().length < 5) {
      toast.error('Descrição deve ter pelo menos 5 caracteres')
      return
    }
    
    const formData = new FormData()
    formData.set('description', description)
    if (assignedTo) formData.set('assigned_to', assignedTo)
    if (unitId) formData.set('unit_id', unitId)
    if (materialsNeeded) formData.set('materials_needed', materialsNeeded)
    if (startDate) formData.set('start_date', startDate)
    if (estimatedEndDate) formData.set('estimated_end_date', estimatedEndDate)
    if (estimatedCost) formData.set('estimated_cost', estimatedCost)
    if (supplierName) formData.set('supplier_name', supplierName)
    if (supplierContact) formData.set('supplier_contact', supplierContact)
    if (notes) formData.set('notes', notes)
    
    startTransition(async () => {
      const result = await addExecution(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Execução adicionada com sucesso!')
        onOpenChange(false)
        resetForm()
      }
    })
  }

  const setQuickDate = (days: number) => {
    const date = addDays(new Date(), days)
    setEstimatedEndDate(format(date, 'yyyy-MM-dd'))
  }

  const selectedMember = departmentMembers.find(m => m.id === assignedTo)
  const selectedUnit = units.find(u => u.id === unitId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Nova Execução de Manutenção
          </DialogTitle>
          <DialogDescription>
            Registre os detalhes da execução de manutenção a ser realizada.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição da Execução <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o que será feito nesta execução..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione">
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
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit_id" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Unidade
              </Label>
              <Select value={unitId} onValueChange={setUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione">
                    {selectedUnit && (
                      <span>{selectedUnit.name} ({selectedUnit.code})</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Materiais */}
          <div className="space-y-2">
            <Label htmlFor="materials_needed" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Materiais Necessários
            </Label>
            <Textarea
              id="materials_needed"
              placeholder="Liste os materiais, ferramentas ou itens necessários..."
              value={materialsNeeded}
              onChange={(e) => setMaterialsNeeded(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data de Início */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Início
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            {/* Data de Conclusão Prevista */}
            <div className="space-y-2">
              <Label htmlFor="estimated_end_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Previsão de Conclusão
              </Label>
              <Input
                id="estimated_end_date"
                type="date"
                value={estimatedEndDate}
                onChange={(e) => setEstimatedEndDate(e.target.value)}
              />
              <div className="flex flex-wrap gap-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(1)} className="text-xs h-6 px-2">
                  Amanhã
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(3)} className="text-xs h-6 px-2">
                  3 dias
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(7)} className="text-xs h-6 px-2">
                  1 semana
                </Button>
              </div>
            </div>
          </div>
          
          {/* Custo Estimado */}
          <div className="space-y-2">
            <Label htmlFor="estimated_cost" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Custo Estimado (R$)
            </Label>
            <Input
              id="estimated_cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="supplier_name" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fornecedor
              </Label>
              <Input
                id="supplier_name"
                placeholder="Nome do fornecedor"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            
            {/* Contato do Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="supplier_contact">
                Contato do Fornecedor
              </Label>
              <Input
                id="supplier_contact"
                placeholder="Telefone ou email"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
              />
            </div>
          </div>
          
          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !description.trim()}
            >
              {isPending ? 'Salvando...' : 'Adicionar Execução'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

