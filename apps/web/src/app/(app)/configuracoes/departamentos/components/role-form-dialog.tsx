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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '../actions'
import { createRole, updateRole } from '../actions'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  departmentId?: string | null
  departmentName?: string | null
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  departmentId,
  departmentName,
}: RoleFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [isGlobal, setIsGlobal] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!role

  useEffect(() => {
    if (open) {
      setName(role?.name || '')
      setIsGlobal(role?.is_global || false)
      setError('')
    }
  }, [open, role])

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
      const roleData = {
        name: trimmedName,
        department_id: isGlobal ? null : departmentId,
        is_global: isGlobal,
      }

      const result = isEditing
        ? await updateRole(role!.id, roleData)
        : await createRole(roleData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? 'Cargo atualizado' : 'Cargo criado')
        onOpenChange(false)
      }
    })
  }

  const showGlobalOption = !departmentId || isEditing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do cargo.'
              : departmentName
                ? `Criar novo cargo para o departamento ${departmentName}.`
                : 'Preencha as informações para criar um novo cargo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nome do Cargo</Label>
            <Input
              id="role-name"
              placeholder="Ex: Gerente"
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

          {showGlobalOption && (
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is-global" className="text-base">Cargo Global</Label>
                <p className="text-sm text-muted-foreground">
                  Cargos globais não pertencem a um departamento específico
                  e têm permissões especiais (ex: Administrador, Diretor).
                </p>
              </div>
              <Switch
                id="is-global"
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
                disabled={isPending}
              />
            </div>
          )}

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
