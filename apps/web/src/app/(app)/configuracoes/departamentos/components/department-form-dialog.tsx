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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Department } from '../actions'
import { createDepartment, updateDepartment } from '../actions'

interface DepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const isEditing = !!department

  useEffect(() => {
    if (open) {
      setName(department?.name || '')
      setError('')
    }
  }, [open, department])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      return
    }
    if (trimmedName.length > 100) {
      setError('Nome muito longo')
      return
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateDepartment(department!.id, trimmedName)
        : await createDepartment(trimmedName)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? 'Departamento atualizado' : 'Departamento criado')
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Departamento' : 'Novo Departamento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do departamento.'
              : 'Preencha as informações para criar um novo departamento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Departamento</Label>
            <Input
              id="name"
              placeholder="Ex: Recursos Humanos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              minLength={2}
              maxLength={100}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
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
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
