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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Loader2, Building2 } from 'lucide-react'
import { createSupplier, updateSupplier } from '../actions'
import { SUPPLIER_CATEGORIES } from '../constants'
import { toast } from 'sonner'

interface Supplier {
  id: string
  name: string
  cnpj: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  category: string | null
  notes: string | null
}

interface SupplierFormDialogProps {
  supplier?: Supplier | null
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function SupplierFormDialog({ supplier, trigger, onSuccess }: SupplierFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const isEditing = !!supplier
  
  // Form fields
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  
  // Load supplier data when editing
  useEffect(() => {
    if (supplier && open) {
      setName(supplier.name || '')
      setCnpj(formatCnpj(supplier.cnpj || ''))
      setContactName(supplier.contact_name || '')
      setPhone(formatPhone(supplier.phone || ''))
      setEmail(supplier.email || '')
      setAddress(supplier.address || '')
      setCategory(supplier.category || '')
      setNotes(supplier.notes || '')
    }
  }, [supplier, open])
  
  // Reset form
  const resetForm = () => {
    setName('')
    setCnpj('')
    setContactName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setCategory('')
    setNotes('')
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
  
  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!name.trim()) {
      toast.error('Nome do fornecedor é obrigatório')
      return
    }
    
    setLoading(true)
    
    try {
      const data = {
        name: name.trim(),
        cnpj: cnpj.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        category: category || undefined,
        notes: notes.trim() || undefined,
      }
      
      const result = isEditing
        ? await updateSupplier(supplier.id, data)
        : await createSupplier(data)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(isEditing ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!')
      setOpen(false)
      if (!isEditing) resetForm()
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Erro ao salvar fornecedor')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen && !isEditing) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            {isEditing ? (
              <>
                <Pencil className="h-4 w-4" />
                Editar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Novo Fornecedor
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados do fornecedor credenciado.'
              : 'Cadastre um novo fornecedor credenciado no sistema.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome / Razão Social *</Label>
            <Input
              id="name"
              placeholder="Nome da empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              maxLength={18}
            />
          </div>
          
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {SUPPLIER_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nome do Contato</Label>
              <Input
                id="contact_name"
                placeholder="Pessoa de contato"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={15}
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              placeholder="Endereço completo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre o fornecedor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

