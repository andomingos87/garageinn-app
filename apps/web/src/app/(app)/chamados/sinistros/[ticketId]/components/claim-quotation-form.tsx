'use client'

import { useState, useEffect } from 'react'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2, Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { addClaimQuotation, getAccreditedSuppliers, selectClaimQuotation } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Supplier {
  id: string
  name: string
  cnpj: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  category: string | null
}

interface ClaimQuotationFormProps {
  ticketId: string
  purchaseId: string
  onSuccess?: () => void
}

export function ClaimQuotationForm({ ticketId, purchaseId, onSuccess }: ClaimQuotationFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  
  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierOpen, setSupplierOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [useCredentialed, setUseCredentialed] = useState(true)
  
  // Form fields
  const [supplierName, setSupplierName] = useState('')
  const [supplierCnpj, setSupplierCnpj] = useState('')
  const [supplierContact, setSupplierContact] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [deliveryDeadline, setDeliveryDeadline] = useState('')
  const [validityDate, setValidityDate] = useState('')
  const [notes, setNotes] = useState('')
  const [selectAfterAdd, setSelectAfterAdd] = useState(false)
  
  // Load suppliers
  useEffect(() => {
    if (open && useCredentialed) {
      loadSuppliers()
    }
  }, [open, useCredentialed])
  
  const loadSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const data = await getAccreditedSuppliers()
      setSuppliers(data)
    } catch (error) {
      console.error('Error loading suppliers:', error)
    } finally {
      setLoadingSuppliers(false)
    }
  }
  
  // Handle supplier selection
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setSupplierName(supplier.name)
    setSupplierCnpj(supplier.cnpj || '')
    setSupplierContact(supplier.contact_name || '')
    setSupplierPhone(supplier.phone || '')
    setSupplierOpen(false)
  }
  
  // Reset form
  const resetForm = () => {
    setSelectedSupplier(null)
    setSupplierName('')
    setSupplierCnpj('')
    setSupplierContact('')
    setSupplierPhone('')
    setTotalPrice('')
    setPaymentTerms('')
    setDeliveryDeadline('')
    setValidityDate('')
    setNotes('')
    setSelectAfterAdd(false)
    setUseCredentialed(true)
  }
  
  // Format CNPJ
  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return value
  }
  
  // Format phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
      }
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }
  
  // Format currency input
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseInt(numbers) / 100
    if (isNaN(amount)) return ''
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  
  // Parse currency to number
  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, '')
    return parseInt(numbers) / 100 || 0
  }
  
  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!supplierName.trim()) {
      toast.error('Nome do fornecedor é obrigatório')
      return
    }
    
    const price = parseCurrency(totalPrice)
    if (!price || price <= 0) {
      toast.error('Preço total deve ser maior que zero')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await addClaimQuotation(ticketId, purchaseId, {
        supplier_id: selectedSupplier?.id,
        supplier_name: supplierName.trim(),
        supplier_cnpj: supplierCnpj.trim() || undefined,
        supplier_contact: supplierContact.trim() || undefined,
        supplier_phone: supplierPhone.trim() || undefined,
        total_price: price,
        payment_terms: paymentTerms.trim() || undefined,
        delivery_deadline: deliveryDeadline || undefined,
        validity_date: validityDate || undefined,
        notes: notes.trim() || undefined,
      })
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Cotação adicionada com sucesso!')
      
      // Se marcou para selecionar, buscar a cotação recém criada e selecionar
      // Por simplicidade, vamos apenas fechar e atualizar
      
      setOpen(false)
      resetForm()
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error adding quotation:', error)
      toast.error('Erro ao adicionar cotação')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Adicionar Cotação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Cotação</DialogTitle>
          <DialogDescription>
            Adicione uma cotação de fornecedor para esta compra.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Fornecedor Credenciado */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="use_credentialed" className="cursor-pointer">
                Usar fornecedor credenciado
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecione um fornecedor já cadastrado no sistema
              </p>
            </div>
            <Switch
              id="use_credentialed"
              checked={useCredentialed}
              onCheckedChange={(checked) => {
                setUseCredentialed(checked)
                if (!checked) {
                  setSelectedSupplier(null)
                }
              }}
            />
          </div>
          
          {/* Seleção de Fornecedor Credenciado */}
          {useCredentialed ? (
            <div className="space-y-2">
              <Label>Fornecedor Credenciado *</Label>
              <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={supplierOpen}
                    className="w-full justify-between"
                    disabled={loadingSuppliers}
                  >
                    {loadingSuppliers ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </span>
                    ) : selectedSupplier ? (
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {selectedSupplier.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Selecione um fornecedor...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar fornecedor..." />
                    <CommandList>
                      <CommandEmpty>
                        Nenhum fornecedor encontrado.
                        <Button
                          variant="link"
                          className="px-0 mt-1"
                          onClick={() => {
                            setUseCredentialed(false)
                            setSupplierOpen(false)
                          }}
                        >
                          Cadastrar manualmente
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => handleSupplierSelect(supplier)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {supplier.category && `${supplier.category} • `}
                                {supplier.cnpj || 'Sem CNPJ'}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedSupplier && (
                <div className="p-3 border rounded-lg bg-muted/30 text-sm space-y-1">
                  {selectedSupplier.cnpj && (
                    <p><strong>CNPJ:</strong> {selectedSupplier.cnpj}</p>
                  )}
                  {selectedSupplier.contact_name && (
                    <p><strong>Contato:</strong> {selectedSupplier.contact_name}</p>
                  )}
                  {selectedSupplier.phone && (
                    <p><strong>Telefone:</strong> {selectedSupplier.phone}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Campos manuais */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Nome do Fornecedor *</Label>
                <Input
                  id="supplier_name"
                  placeholder="Nome da empresa ou pessoa"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_cnpj">CNPJ</Label>
                  <Input
                    id="supplier_cnpj"
                    placeholder="00.000.000/0000-00"
                    value={supplierCnpj}
                    onChange={(e) => setSupplierCnpj(formatCnpj(e.target.value))}
                    maxLength={18}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier_phone">Telefone</Label>
                  <Input
                    id="supplier_phone"
                    placeholder="(00) 00000-0000"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier_contact">Nome do Contato</Label>
                <Input
                  id="supplier_contact"
                  placeholder="Pessoa de contato"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Valores da Cotação */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Valores da Cotação</h4>
            
            <div className="space-y-2">
              <Label htmlFor="total_price">Preço Total *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="total_price"
                  placeholder="0,00"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(formatCurrency(e.target.value))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Forma de Pagamento</Label>
              <Input
                id="payment_terms"
                placeholder="Ex: 30/60/90 dias, à vista, PIX, etc."
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_deadline">Prazo de Entrega</Label>
                <Input
                  id="delivery_deadline"
                  type="date"
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validity_date">Validade da Cotação</Label>
                <Input
                  id="validity_date"
                  type="date"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre a cotação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
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
              Adicionar Cotação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

