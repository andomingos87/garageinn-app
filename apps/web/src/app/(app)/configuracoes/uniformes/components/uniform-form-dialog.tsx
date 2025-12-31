'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createUniform, updateUniform, type Uniform } from '../actions'
import { UNIFORM_TYPES, UNIFORM_SIZES } from '../constants'

interface UniformFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uniform?: Uniform | null
}

export function UniformFormDialog({
  open,
  onOpenChange,
  uniform,
}: UniformFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    type: '',
    min_stock: 5,
    current_stock: 0,
  })

  const isEditing = !!uniform

  useEffect(() => {
    if (uniform) {
      setFormData({
        name: uniform.name,
        description: uniform.description || '',
        size: uniform.size || '',
        type: uniform.type || '',
        min_stock: uniform.min_stock,
        current_stock: uniform.current_stock,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        size: '',
        type: '',
        min_stock: 5,
        current_stock: 0,
      })
    }
  }, [uniform, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateUniform(uniform.id, {
            name: formData.name,
            description: formData.description,
            size: formData.size,
            type: formData.type,
            min_stock: formData.min_stock,
          })
        : await createUniform({
            name: formData.name,
            description: formData.description,
            size: formData.size,
            type: formData.type,
            min_stock: formData.min_stock,
            current_stock: formData.current_stock,
          })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? 'Uniforme atualizado' : 'Uniforme criado')
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Uniforme' : 'Novo Uniforme'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Edite as informações do uniforme'
                : 'Cadastre um novo item de uniforme no estoque'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Camiseta Polo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIFORM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="size">Tamanho</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIFORM_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes adicionais do uniforme..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min={0}
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Alerta quando atingir este valor
                </p>
              </div>

              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="current_stock">Estoque Inicial</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min={0}
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade inicial disponível
                  </p>
                </div>
              )}
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

