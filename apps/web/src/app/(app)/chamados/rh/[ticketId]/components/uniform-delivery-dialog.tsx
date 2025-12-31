'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Package, 
  CheckCircle, 
  AlertTriangle, 
  PackageMinus,
  Shirt
} from 'lucide-react'
import { toast } from 'sonner'
import { deliverUniform, checkUniformStock } from '../../actions'

interface UniformDeliveryDialogProps {
  ticketId: string
  uniformName: string
  uniformSize: string | null
  quantity: number
}

export function UniformDeliveryDialog({
  ticketId,
  uniformName,
  uniformSize,
  quantity,
}: UniformDeliveryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')
  const [stockCheck, setStockCheck] = useState<{
    canDeliver: boolean
    reason?: string
    currentStock?: number
    requestedQuantity?: number
  } | null>(null)

  useEffect(() => {
    if (open) {
      // Verificar estoque ao abrir o diálogo
      checkUniformStock(ticketId).then(setStockCheck)
    }
  }, [open, ticketId])

  const handleDeliver = () => {
    startTransition(async () => {
      const result = await deliverUniform(ticketId, notes)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Uniforme entregue com sucesso!')
        setOpen(false)
        setNotes('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" variant="default">
          <Shirt className="h-4 w-4" />
          Entregar Uniforme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Confirmar Entrega de Uniforme
          </DialogTitle>
          <DialogDescription>
            Ao confirmar, o estoque será atualizado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Uniform Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uniforme</span>
              <span className="font-medium">{uniformName}</span>
            </div>
            {uniformSize && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tamanho</span>
                <Badge variant="outline">{uniformSize}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quantidade</span>
              <Badge variant="secondary">{quantity}</Badge>
            </div>
          </div>

          {/* Stock Status */}
          {stockCheck && (
            <div className={`rounded-lg p-4 ${
              stockCheck.canDeliver 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {stockCheck.canDeliver ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className={`font-medium ${
                    stockCheck.canDeliver ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {stockCheck.canDeliver 
                      ? 'Estoque disponível' 
                      : 'Estoque insuficiente'}
                  </div>
                  <div className={`text-sm ${
                    stockCheck.canDeliver ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {stockCheck.canDeliver 
                      ? `${stockCheck.currentStock} unidades em estoque`
                      : stockCheck.reason}
                  </div>
                  {stockCheck.canDeliver && (
                    <div className="text-xs text-green-600 mt-1">
                      Após entrega: {(stockCheck.currentStock || 0) - (stockCheck.requestedQuantity || 0)} unidades
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a entrega..."
              rows={2}
            />
          </div>
        </div>

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
            onClick={handleDeliver}
            disabled={isPending || !stockCheck?.canDeliver}
            className="gap-2"
          >
            {isPending ? (
              'Processando...'
            ) : !stockCheck?.canDeliver ? (
              <>
                <PackageMinus className="h-4 w-4" />
                Sem Estoque
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar Entrega
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

