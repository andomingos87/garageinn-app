'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Receipt, 
  Plus, 
  Check, 
  Trash2, 
  Building2, 
  Phone, 
  Calendar,
  DollarSign,
  Package,
  FileText,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { addQuotation, selectQuotation, deleteQuotation } from '../../actions'

interface Quotation {
  id: string
  supplier_name: string
  supplier_cnpj: string | null
  supplier_contact: string | null
  unit_price: number
  total_price: number
  quantity: number
  payment_terms: string | null
  delivery_deadline: string | null
  validity_date: string | null
  notes: string | null
  status: string
  is_selected: boolean
  created_at: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface TicketQuotationsProps {
  ticketId: string
  quotations: Quotation[]
  canManage: boolean
  ticketStatus: string
  itemQuantity: number | null
}

export function TicketQuotations({ 
  ticketId, 
  quotations, 
  canManage, 
  ticketStatus,
  itemQuantity 
}: TicketQuotationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const handleAddQuotation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addQuotation(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cotação adicionada com sucesso')
        setIsDialogOpen(false)
      }
    })
  }
  
  const handleSelectQuotation = (quotationId: string) => {
    startTransition(async () => {
      const result = await selectQuotation(ticketId, quotationId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cotação selecionada com sucesso')
      }
    })
  }
  
  const handleDeleteQuotation = (quotationId: string) => {
    startTransition(async () => {
      const result = await deleteQuotation(ticketId, quotationId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cotação removida')
      }
    })
  }
  
  const canAddQuotation = canManage && ['awaiting_triage', 'in_progress', 'quoting'].includes(ticketStatus)
  const canSelectQuotation = canManage && ['quoting', 'awaiting_approval'].includes(ticketStatus)
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Cotações
            {quotations.length > 0 && (
              <Badge variant="secondary">{quotations.length}</Badge>
            )}
          </CardTitle>
          
          {canAddQuotation && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Cotação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar Cotação</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do fornecedor e valores da cotação.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddQuotation} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="supplier_name">Fornecedor *</Label>
                      <Input
                        id="supplier_name"
                        name="supplier_name"
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supplier_cnpj">CNPJ</Label>
                      <Input
                        id="supplier_cnpj"
                        name="supplier_cnpj"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supplier_contact">Contato</Label>
                      <Input
                        id="supplier_contact"
                        name="supplier_contact"
                        placeholder="Telefone ou email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">Preço Unitário *</Label>
                      <Input
                        id="unit_price"
                        name="unit_price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        defaultValue={itemQuantity || 1}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment_terms">Forma de Pagamento</Label>
                      <Input
                        id="payment_terms"
                        name="payment_terms"
                        placeholder="Ex: 30/60/90 dias"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delivery_deadline">Prazo de Entrega</Label>
                      <Input
                        id="delivery_deadline"
                        name="delivery_deadline"
                        type="date"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="validity_date">Validade da Cotação</Label>
                      <Input
                        id="validity_date"
                        name="validity_date"
                        type="date"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Informações adicionais..."
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? 'Salvando...' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {quotations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma cotação adicionada ainda
          </p>
        ) : (
          <div className="space-y-3">
            {quotations.map((quotation) => (
              <div 
                key={quotation.id} 
                className={`p-4 rounded-lg border ${
                  quotation.is_selected 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{quotation.supplier_name}</span>
                      {quotation.is_selected && (
                        <Badge className="bg-green-500 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Selecionada
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Preço Unitário
                        </p>
                        <p className="font-medium">{formatCurrency(quotation.unit_price)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Quantidade
                        </p>
                        <p className="font-medium">{quotation.quantity}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-primary">{formatCurrency(quotation.total_price)}</p>
                      </div>
                      
                      {quotation.delivery_deadline && (
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Prazo
                          </p>
                          <p className="font-medium">
                            {format(new Date(quotation.delivery_deadline), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {quotation.supplier_contact && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {quotation.supplier_contact}
                      </p>
                    )}
                    
                    {quotation.notes && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                        <FileText className="h-3 w-3 mt-0.5" />
                        {quotation.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Adicionada {formatDistanceToNow(new Date(quotation.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })} por {quotation.creator?.full_name || 'Desconhecido'}
                    </p>
                  </div>
                  
                  {canManage && !quotation.is_selected && (
                    <div className="flex flex-col gap-2">
                      {canSelectQuotation && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleSelectQuotation(quotation.id)}
                          disabled={isPending}
                        >
                          <Check className="h-3 w-3" />
                          Selecionar
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover cotação?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A cotação de {quotation.supplier_name} será removida permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuotation(quotation.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

