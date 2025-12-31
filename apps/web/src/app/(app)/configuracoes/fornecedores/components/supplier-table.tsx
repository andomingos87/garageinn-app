'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Phone,
  Mail,
  Building2,
  Loader2,
} from 'lucide-react'
import { SupplierFormDialog } from './supplier-form-dialog'
import { toggleSupplierStatus, deleteSupplier } from '../actions'
import { getCategoryLabel } from '../constants'
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
  is_active: boolean
  created_at: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface SupplierTableProps {
  suppliers: Supplier[]
}

// Format CNPJ for display
const formatCnpj = (cnpj: string | null) => {
  if (!cnpj) return '-'
  const numbers = cnpj.replace(/\D/g, '')
  if (numbers.length !== 14) return cnpj
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; supplier: Supplier | null }>({
    open: false,
    supplier: null
  })
  
  // Toggle status
  const handleToggleStatus = async (supplier: Supplier) => {
    setLoading(supplier.id)
    try {
      const result = await toggleSupplierStatus(supplier.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success(result.isActive ? 'Fornecedor ativado!' : 'Fornecedor desativado!')
      router.refresh()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Erro ao alterar status')
    } finally {
      setLoading(null)
    }
  }
  
  // Delete supplier
  const handleDelete = async () => {
    if (!deleteDialog.supplier) return
    
    setLoading(deleteDialog.supplier.id)
    try {
      const result = await deleteSupplier(deleteDialog.supplier.id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Fornecedor excluído!')
      setDeleteDialog({ open: false, supplier: null })
      router.refresh()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Erro ao excluir fornecedor')
    } finally {
      setLoading(null)
    }
  }
  
  if (suppliers.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/30">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h4 className="font-medium mb-2">Nenhum fornecedor encontrado</h4>
        <p className="text-sm text-muted-foreground">
          Cadastre fornecedores credenciados para usar nas cotações de sinistros.
        </p>
      </div>
    )
  }
  
  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} className={!supplier.is_active ? 'opacity-60' : ''}>
                <TableCell>
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    {supplier.address && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {supplier.address}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatCnpj(supplier.cnpj)}
                </TableCell>
                <TableCell>
                  {supplier.category ? (
                    <Badge variant="outline">
                      {getCategoryLabel(supplier.category)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {supplier.contact_name && (
                      <p className="text-sm">{supplier.contact_name}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {supplier.phone && (
                        <a 
                          href={`tel:${supplier.phone.replace(/\D/g, '')}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </a>
                      )}
                      {supplier.email && (
                        <a 
                          href={`mailto:${supplier.email}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </a>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {supplier.is_active ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={loading === supplier.id}
                      >
                        {loading === supplier.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <SupplierFormDialog 
                        supplier={supplier}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                        {supplier.is_active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, supplier })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, supplier: open ? deleteDialog.supplier : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor <strong>{deleteDialog.supplier?.name}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita. Se o fornecedor possui cotações vinculadas, 
              considere desativá-lo em vez de excluir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

