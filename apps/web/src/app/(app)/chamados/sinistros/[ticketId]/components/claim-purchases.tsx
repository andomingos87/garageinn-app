'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  Check,
  X,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import { ClaimPurchaseForm } from './claim-purchase-form'
import { ClaimQuotationForm } from './claim-quotation-form'
import { approveClaimPurchase, updateClaimPurchaseStatus } from '../actions'
import { toast } from 'sonner'
import { PURCHASE_STATUS } from '../../constants'

interface PurchaseItem {
  id: string
  item_name: string
  description: string | null
  quantity: number
  unit_of_measure: string
  estimated_unit_price: number | null
  final_unit_price: number | null
}

interface Quotation {
  id: string
  supplier_id: string | null
  supplier_name: string
  supplier_cnpj: string | null
  supplier_contact: string | null
  supplier_phone: string | null
  total_price: number
  payment_terms: string | null
  delivery_deadline: string | null
  validity_date: string | null
  notes: string | null
  status: string
  is_selected: boolean
  created_at: string
  supplier: {
    id: string
    name: string
    cnpj: string | null
    category: string | null
  } | null
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface Purchase {
  id: string
  purchase_number: number
  title: string
  description: string | null
  status: string
  estimated_total: number | null
  approved_total: number | null
  due_date: string | null
  approved_at: string | null
  completed_at: string | null
  rejection_reason: string | null
  created_at: string
  assigned: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  approver: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  items: PurchaseItem[]
  quotations: Quotation[]
}

interface ClaimPurchasesProps {
  ticketId: string
  purchases: Purchase[]
  canManage: boolean
  isManager?: boolean
}

// Status badge colors
const getStatusBadge = (status: string) => {
  const statusConfig = PURCHASE_STATUS.find(s => s.value === status)
  const label = statusConfig?.label || status
  
  const colors: Record<string, string> = {
    'awaiting_quotation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'quotations_received': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'awaiting_approval': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'in_progress': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    'delivered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    'cancelled': 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500',
  }
  
  return (
    <Badge variant="outline" className={colors[status] || ''}>
      {label}
    </Badge>
  )
}

// Status icon
const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    'awaiting_quotation': <Clock className="h-4 w-4 text-yellow-500" />,
    'quotations_received': <FileText className="h-4 w-4 text-blue-500" />,
    'awaiting_approval': <AlertCircle className="h-4 w-4 text-purple-500" />,
    'approved': <Check className="h-4 w-4 text-green-500" />,
    'rejected': <X className="h-4 w-4 text-red-500" />,
    'in_progress': <Package className="h-4 w-4 text-cyan-500" />,
    'delivered': <Truck className="h-4 w-4 text-emerald-500" />,
    'completed': <CheckCircle2 className="h-4 w-4 text-gray-500" />,
  }
  
  return icons[status] || <Clock className="h-4 w-4" />
}

export function ClaimPurchases({ ticketId, purchases, canManage, isManager = false }: ClaimPurchasesProps) {
  const router = useRouter()
  const [expandedPurchases, setExpandedPurchases] = useState<string[]>([])
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; purchaseId: string; decision: 'approved' | 'rejected' }>({
    open: false,
    purchaseId: '',
    decision: 'approved'
  })
  const [approvalNotes, setApprovalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Toggle purchase expansion
  const togglePurchase = (id: string) => {
    setExpandedPurchases(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }
  
  // Handle approval
  const handleApproval = async () => {
    setLoading(true)
    try {
      const result = await approveClaimPurchase(
        ticketId,
        approvalDialog.purchaseId,
        approvalDialog.decision,
        approvalNotes || undefined
      )
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(approvalDialog.decision === 'approved' 
        ? 'Compra aprovada com sucesso!' 
        : 'Compra rejeitada'
      )
      setApprovalDialog({ open: false, purchaseId: '', decision: 'approved' })
      setApprovalNotes('')
      router.refresh()
    } catch (error) {
      console.error('Error handling approval:', error)
      toast.error('Erro ao processar aprovação')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle status update
  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    setLoading(true)
    try {
      const result = await updateClaimPurchaseStatus(ticketId, purchaseId, newStatus)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Status atualizado!')
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }
  
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compras Internas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as compras de peças e materiais para este sinistro
          </p>
        </div>
        {canManage && (
          <ClaimPurchaseForm ticketId={ticketId} />
        )}
      </div>
      
      {/* Lista de Compras */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="font-medium mb-2">Nenhuma compra registrada</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Crie uma solicitação de compra para peças ou materiais necessários.
            </p>
            {canManage && (
              <ClaimPurchaseForm ticketId={ticketId} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map(purchase => {
            const isExpanded = expandedPurchases.includes(purchase.id)
            const selectedQuotation = purchase.quotations.find(q => q.is_selected)
            const quotationsCount = purchase.quotations.length
            const canAddQuotation = ['awaiting_quotation', 'quotations_received'].includes(purchase.status)
            const canApprove = purchase.status === 'awaiting_approval' && isManager
            const canUpdateStatus = ['approved', 'in_progress', 'delivered'].includes(purchase.status) && canManage
            
            return (
              <Card key={purchase.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => togglePurchase(purchase.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(purchase.status)}
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              #{purchase.purchase_number} - {purchase.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-3 mt-1">
                              <span>{formatDate(purchase.created_at)}</span>
                              <span>•</span>
                              <span>{purchase.items.length} item(s)</span>
                              <span>•</span>
                              <span>{quotationsCount} cotação(ões)</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(purchase.status)}
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {selectedQuotation ? 'Aprovado' : 'Estimado'}
                            </p>
                            <p className="font-semibold">
                              {formatCurrency(selectedQuotation?.total_price || purchase.estimated_total)}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-6">
                      {/* Descrição */}
                      {purchase.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">{purchase.description}</p>
                        </div>
                      )}
                      
                      {/* Itens */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Itens da Compra
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-3 font-medium">Item</th>
                                <th className="text-center p-3 font-medium">Qtd</th>
                                <th className="text-center p-3 font-medium">Un.</th>
                                <th className="text-right p-3 font-medium">Preço Est.</th>
                                <th className="text-right p-3 font-medium">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchase.items.map(item => (
                                <tr key={item.id} className="border-t">
                                  <td className="p-3">
                                    <p className="font-medium">{item.item_name}</p>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground">{item.description}</p>
                                    )}
                                  </td>
                                  <td className="text-center p-3">{item.quantity}</td>
                                  <td className="text-center p-3">{item.unit_of_measure}</td>
                                  <td className="text-right p-3">{formatCurrency(item.estimated_unit_price)}</td>
                                  <td className="text-right p-3 font-medium">
                                    {item.estimated_unit_price 
                                      ? formatCurrency(item.estimated_unit_price * item.quantity)
                                      : '-'
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-muted/30">
                              <tr className="border-t">
                                <td colSpan={4} className="p-3 text-right font-medium">Total Estimado:</td>
                                <td className="p-3 text-right font-bold">{formatCurrency(purchase.estimated_total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                      
                      {/* Cotações */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Cotações ({quotationsCount})
                            {quotationsCount < 2 && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                Mínimo 2 cotações
                              </Badge>
                            )}
                          </h4>
                          {canAddQuotation && canManage && (
                            <ClaimQuotationForm 
                              ticketId={ticketId} 
                              purchaseId={purchase.id}
                            />
                          )}
                        </div>
                        
                        {quotationsCount === 0 ? (
                          <div className="p-4 border rounded-lg bg-muted/30 text-center">
                            <p className="text-sm text-muted-foreground">
                              Nenhuma cotação registrada. Adicione pelo menos 2 cotações para aprovar.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {purchase.quotations.map(quotation => (
                              <div 
                                key={quotation.id}
                                className={`p-4 border rounded-lg ${
                                  quotation.is_selected 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                                    : 'bg-card'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{quotation.supplier_name}</span>
                                      {quotation.is_selected && (
                                        <Badge className="bg-green-500">
                                          <Check className="h-3 w-3 mr-1" />
                                          Selecionada
                                        </Badge>
                                      )}
                                      {quotation.supplier?.category && (
                                        <Badge variant="outline" className="text-xs">
                                          {quotation.supplier.category}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      {quotation.supplier_cnpj && (
                                        <p>CNPJ: {quotation.supplier_cnpj}</p>
                                      )}
                                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {quotation.payment_terms && (
                                          <span>Pagamento: {quotation.payment_terms}</span>
                                        )}
                                        {quotation.delivery_deadline && (
                                          <span>Entrega: {formatDate(quotation.delivery_deadline)}</span>
                                        )}
                                        {quotation.validity_date && (
                                          <span>Validade: {formatDate(quotation.validity_date)}</span>
                                        )}
                                      </div>
                                      {quotation.notes && (
                                        <p className="italic">{quotation.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">{formatCurrency(quotation.total_price)}</p>
                                    {quotation.creator && (
                                      <div className="flex items-center gap-1 justify-end mt-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={quotation.creator.avatar_url || undefined} />
                                          <AvatarFallback className="text-[10px]">
                                            {quotation.creator.full_name?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">
                                          {quotation.creator.full_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Ações */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {purchase.creator && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={purchase.creator.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {purchase.creator.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>Criado por {purchase.creator.full_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Botões de aprovação */}
                          {canApprove && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setApprovalDialog({
                                  open: true,
                                  purchaseId: purchase.id,
                                  decision: 'rejected'
                                })}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setApprovalDialog({
                                  open: true,
                                  purchaseId: purchase.id,
                                  decision: 'approved'
                                })}
                                disabled={quotationsCount < 2}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                            </>
                          )}
                          
                          {/* Botões de atualização de status */}
                          {canUpdateStatus && (
                            <>
                              {purchase.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(purchase.id, 'in_progress')}
                                  disabled={loading}
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  Iniciar Compra
                                </Button>
                              )}
                              {purchase.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(purchase.id, 'delivered')}
                                  disabled={loading}
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Marcar Entregue
                                </Button>
                              )}
                              {purchase.status === 'delivered' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(purchase.id, 'completed')}
                                  disabled={loading}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Concluir
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Info de rejeição */}
                      {purchase.status === 'rejected' && purchase.rejection_reason && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-400">
                            <strong>Motivo da rejeição:</strong> {purchase.rejection_reason}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Dialog de Aprovação */}
      <AlertDialog open={approvalDialog.open} onOpenChange={(open) => {
        if (!open) {
          setApprovalDialog({ open: false, purchaseId: '', decision: 'approved' })
          setApprovalNotes('')
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalDialog.decision === 'approved' ? 'Aprovar Compra' : 'Rejeitar Compra'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalDialog.decision === 'approved' 
                ? 'Confirma a aprovação desta compra? A cotação selecionada será utilizada.'
                : 'Tem certeza que deseja rejeitar esta compra?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="approval_notes">
              {approvalDialog.decision === 'approved' ? 'Observações (opcional)' : 'Motivo da rejeição'}
            </Label>
            <Textarea
              id="approval_notes"
              placeholder={approvalDialog.decision === 'approved' 
                ? 'Adicione observações se necessário...'
                : 'Informe o motivo da rejeição...'
              }
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproval}
              disabled={loading || (approvalDialog.decision === 'rejected' && !approvalNotes.trim())}
              className={approvalDialog.decision === 'approved' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {approvalDialog.decision === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

