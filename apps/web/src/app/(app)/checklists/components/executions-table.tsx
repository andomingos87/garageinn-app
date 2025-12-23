'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Building2,
} from 'lucide-react'
import { deleteExecutions } from '../actions'
import type { ExecutionWithDetails } from '../actions'

interface ExecutionsTableProps {
  executions: ExecutionWithDetails[]
  isAdmin: boolean
}

export function ExecutionsTable({ executions, isAdmin }: ExecutionsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string, hasNonConformities: boolean | null) => {
    if (status === 'completed') {
      if (hasNonConformities) {
        return (
          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Com pendências
          </Badge>
        )
      }
      return (
        <Badge variant="default" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Concluído
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
        <Clock className="mr-1 h-3 w-3" />
        Em andamento
      </Badge>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(executions.map((e) => e.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteExecutions(Array.from(selectedIds))
      if (result.error) {
        alert(result.error)
      } else {
        setSelectedIds(new Set())
      }
    } catch (error) {
      console.error('Error deleting executions:', error)
      alert('Erro ao excluir execuções')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (executions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mt-1">
          Ajuste os filtros ou execute novos checklists
        </p>
      </div>
    )
  }

  const isAllSelected = executions.length > 0 && selectedIds.size === executions.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < executions.length

  return (
    <>
      {/* Bulk Actions Bar */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 mb-4">
          <span className="text-sm">
            {selectedIds.size} {selectedIds.size === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Selecionados
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todos"
                  className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
            )}
            <TableHead>Data/Hora</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead className="hidden md:table-cell">Template</TableHead>
            <TableHead className="hidden lg:table-cell">Executado por</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Não-Conf.</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              {isAdmin && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(execution.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(execution.id, checked as boolean)
                    }
                    aria-label={`Selecionar ${execution.unit_name}`}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="font-medium">{formatDate(execution.started_at)}</div>
                <div className="text-sm text-muted-foreground">{formatTime(execution.started_at)}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium">{execution.unit_name}</div>
                    <div className="text-sm text-muted-foreground">{execution.unit_code}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">{execution.template_name}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {execution.template_type === 'opening' ? 'Abertura' : 'Supervisão'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={execution.executed_by_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(execution.executed_by_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate max-w-[120px]">
                    {execution.executed_by_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(execution.status, execution.has_non_conformities)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {execution.non_conformities_count && execution.non_conformities_count > 0 ? (
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive">
                    {execution.non_conformities_count}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/checklists/${execution.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalhes</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir execuções?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'execução' : 'execuções'} de checklist.
              <br />
              <strong className="text-destructive">Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

