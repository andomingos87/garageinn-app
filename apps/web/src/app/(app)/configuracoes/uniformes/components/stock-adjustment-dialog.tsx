'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { adjustUniformStock, type Uniform } from '../actions'
import { ArrowDown, ArrowUp, RefreshCw, Package } from 'lucide-react'

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uniform: Uniform | null
}

type AdjustmentType = 'entrada' | 'saida' | 'ajuste'

const adjustmentTypes: { value: AdjustmentType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'entrada', label: 'Entrada', icon: ArrowDown, color: 'text-green-600' },
  { value: 'saida', label: 'Saída', icon: ArrowUp, color: 'text-red-600' },
  { value: 'ajuste', label: 'Ajuste Direto', icon: RefreshCw, color: 'text-blue-600' },
]

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  uniform,
}: StockAdjustmentDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState<AdjustmentType>('entrada')
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!uniform) return

    if (quantity <= 0 && type !== 'ajuste') {
      toast.error('Quantidade deve ser maior que zero')
      return
    }

    if (type === 'ajuste' && quantity < 0) {
      toast.error('Estoque não pode ser negativo')
      return
    }

    startTransition(async () => {
      const result = await adjustUniformStock(uniform.id, quantity, type)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Estoque atualizado: ${result.newStock} unidades`)
        onOpenChange(false)
        setQuantity(1)
        setType('entrada')
      }
    })
  }

  const selectedType = adjustmentTypes.find(t => t.value === type)
  const Icon = selectedType?.icon || Package

  const getPreviewStock = () => {
    if (!uniform) return 0
    if (type === 'entrada') return uniform.current_stock + quantity
    if (type === 'saida') return Math.max(0, uniform.current_stock - quantity)
    return quantity
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              {uniform?.name} {uniform?.size ? `(${uniform.size})` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Current Stock Display */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Estoque atual</span>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {uniform?.current_stock || 0}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Movimentação</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as AdjustmentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon className={`h-4 w-4 ${t.color}`} />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">
                {type === 'ajuste' ? 'Novo Estoque' : 'Quantidade'}
              </Label>
              <Input
                id="quantity"
                type="number"
                min={type === 'ajuste' ? 0 : 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
              {type !== 'ajuste' && (
                <p className="text-xs text-muted-foreground">
                  {type === 'entrada' 
                    ? 'Quantidade a adicionar ao estoque' 
                    : 'Quantidade a remover do estoque'}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${selectedType?.color}`} />
                <span className="text-sm font-medium">Estoque após ajuste</span>
              </div>
              <Badge 
                variant={getPreviewStock() <= (uniform?.min_stock || 0) ? 'destructive' : 'default'}
                className="text-lg font-bold"
              >
                {getPreviewStock()}
              </Badge>
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
              {isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

