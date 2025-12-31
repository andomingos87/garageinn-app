'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { createClaimPurchase } from '../actions'
import { toast } from 'sonner'

interface PurchaseItem {
  id: string
  item_name: string
  description: string
  quantity: number
  unit_of_measure: string
  estimated_unit_price: number
}

interface ClaimPurchaseFormProps {
  ticketId: string
  onSuccess?: () => void
}

const UNITS_OF_MEASURE = [
  { value: 'un', label: 'Unidade' },
  { value: 'kg', label: 'Quilograma' },
  { value: 'm', label: 'Metro' },
  { value: 'm²', label: 'Metro²' },
  { value: 'litro', label: 'Litro' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pç', label: 'Peça' },
  { value: 'jg', label: 'Jogo' },
  { value: 'par', label: 'Par' },
]

export function ClaimPurchaseForm({ ticketId, onSuccess }: ClaimPurchaseFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: crypto.randomUUID(),
      item_name: '',
      description: '',
      quantity: 1,
      unit_of_measure: 'un',
      estimated_unit_price: 0,
    }
  ])
  
  // Calcular total estimado
  const estimatedTotal = items.reduce((total, item) => {
    return total + (item.estimated_unit_price * item.quantity)
  }, 0)
  
  // Adicionar item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        item_name: '',
        description: '',
        quantity: 1,
        unit_of_measure: 'un',
        estimated_unit_price: 0,
      }
    ])
  }
  
  // Remover item
  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('A compra deve ter pelo menos 1 item')
      return
    }
    setItems(items.filter(item => item.id !== id))
  }
  
  // Atualizar item
  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }
  
  // Reset form
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setItems([{
      id: crypto.randomUUID(),
      item_name: '',
      description: '',
      quantity: 1,
      unit_of_measure: 'un',
      estimated_unit_price: 0,
    }])
  }
  
  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    
    const validItems = items.filter(item => item.item_name.trim())
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos 1 item válido')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await createClaimPurchase(ticketId, {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        items: validItems.map(item => ({
          item_name: item.item_name.trim(),
          description: item.description.trim() || undefined,
          quantity: item.quantity,
          unit_of_measure: item.unit_of_measure,
          estimated_unit_price: item.estimated_unit_price || undefined,
        }))
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Compra criada com sucesso!')
      setOpen(false)
      resetForm()
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating purchase:', error)
      toast.error('Erro ao criar compra')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Nova Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Compra Interna</DialogTitle>
          <DialogDescription>
            Crie uma solicitação de compra de peças ou materiais para este sinistro.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Peças para reparo do para-choque"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da compra..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date">Prazo Desejado</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          {/* Lista de Itens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens da Compra</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-4 border rounded-lg bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`item_name_${item.id}`}>Nome do Item *</Label>
                      <Input
                        id={`item_name_${item.id}`}
                        placeholder="Ex: Para-choque dianteiro"
                        value={item.item_name}
                        onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`quantity_${item.id}`}>Quantidade</Label>
                        <Input
                          id={`quantity_${item.id}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`unit_${item.id}`}>Unidade</Label>
                        <Select
                          value={item.unit_of_measure}
                          onValueChange={(value) => updateItem(item.id, 'unit_of_measure', value)}
                        >
                          <SelectTrigger id={`unit_${item.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS_OF_MEASURE.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`price_${item.id}`}>Preço Est. (R$)</Label>
                        <Input
                          id={`price_${item.id}`}
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0,00"
                          value={item.estimated_unit_price || ''}
                          onChange={(e) => updateItem(item.id, 'estimated_unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    {item.estimated_unit_price > 0 && item.quantity > 1 && (
                      <p className="text-sm text-muted-foreground text-right">
                        Subtotal: {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(item.estimated_unit_price * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Estimado */}
            {estimatedTotal > 0 && (
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="font-medium">Total Estimado:</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(estimatedTotal)}
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Compra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

