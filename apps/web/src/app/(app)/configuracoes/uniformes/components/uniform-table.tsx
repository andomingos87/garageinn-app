'use client'

import { useState } from 'react'
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
import { MoreHorizontal, Pencil, Trash2, Package, AlertTriangle, PackageMinus } from 'lucide-react'
import type { Uniform } from '../actions'

interface UniformTableProps {
  uniforms: Uniform[]
  onEdit: (uniform: Uniform) => void
  onDelete: (uniformId: string) => void
  onAdjustStock: (uniform: Uniform) => void
  isLoading?: boolean
}

export function UniformTable({
  uniforms,
  onEdit,
  onDelete,
  onAdjustStock,
  isLoading,
}: UniformTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const getStockBadge = (uniform: Uniform) => {
    if (uniform.current_stock === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <PackageMinus className="h-3 w-3" />
          Sem estoque
        </Badge>
      )
    }
    if (uniform.current_stock <= uniform.min_stock) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600 bg-yellow-50">
          <AlertTriangle className="h-3 w-3" />
          Estoque baixo
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Package className="h-3 w-3" />
        OK
      </Badge>
    )
  }

  if (uniforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum uniforme cadastrado
        </h3>
        <p className="text-muted-foreground">
          Comece cadastrando os itens de uniforme do estoque.
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniforms.map((uniform) => (
            <TableRow key={uniform.id}>
              <TableCell className="font-medium">
                {uniform.name}
                {uniform.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                    {uniform.description}
                  </p>
                )}
              </TableCell>
              <TableCell>{uniform.type || '-'}</TableCell>
              <TableCell>{uniform.size || '-'}</TableCell>
              <TableCell className="text-center font-semibold">
                {uniform.current_stock}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {uniform.min_stock}
              </TableCell>
              <TableCell>{getStockBadge(uniform)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAdjustStock(uniform)}>
                      <Package className="mr-2 h-4 w-4" />
                      Ajustar Estoque
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(uniform)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteId(uniform.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir uniforme?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Uniformes com transações não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

