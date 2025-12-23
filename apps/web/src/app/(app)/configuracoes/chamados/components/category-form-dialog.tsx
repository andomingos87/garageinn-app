'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createCategory, updateCategory } from '../actions'
import type { Department, TicketCategory } from '../actions'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: TicketCategory | null
  departments: Department[]
  defaultDepartmentId?: string | null
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  departments,
  defaultDepartmentId,
}: CategoryFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [isActive, setIsActive] = useState(true)

  const isEditing = !!category

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setDepartmentId(category.department_id)
        setIsActive(category.status === 'active')
      } else {
        setName('')
        setDepartmentId(defaultDepartmentId || departments[0]?.id || '')
        setIsActive(true)
      }
    }
  }, [open, category, defaultDepartmentId, departments])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!departmentId) {
      toast.error('Selecione um departamento')
      return
    }

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          department_id: departmentId,
          status: isActive ? 'active' as const : 'inactive' as const,
        }

        const result = isEditing
          ? await updateCategory(category.id, data)
          : await createCategory(data)

        if (result.error) {
          toast.error(result.error)
          return
        }

        toast.success(
          isEditing
            ? 'Categoria atualizada com sucesso'
            : 'Categoria criada com sucesso'
        )
        onOpenChange(false)
      } catch (error) {
        console.error('Error saving category:', error)
        toast.error('Erro ao salvar categoria')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Altere os dados da categoria de chamado.'
                : 'Preencha os dados para criar uma nova categoria de chamado.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manutenção Corretiva"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Categoria ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Categorias inativas não aparecem na abertura de chamados
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

