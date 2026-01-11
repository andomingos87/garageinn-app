'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TestTicket, deleteTicket, deleteMultipleTickets } from '../actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DeleteTicketsTableProps {
  tickets: TestTicket[]
}

const statusLabels: Record<string, string> = {
  awaiting_triage: 'Aguardando Triagem',
  awaiting_approval_encarregado: 'Aguardando Encarregado',
  awaiting_approval_supervisor: 'Aguardando Supervisor',
  awaiting_approval_gerente: 'Aguardando Gerente',
  prioritized: 'Priorizado',
  in_progress: 'Em Andamento',
  quoting: 'Em Cotação',
  approved: 'Aprovado',
  awaiting_return: 'Aguardando Retorno',
  denied: 'Negado',
  cancelled: 'Cancelado',
}

export function DeleteTicketsTable({ tickets }: DeleteTicketsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }
  
  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tickets.map(t => t.id)))
    }
  }
  
  const handleDeleteSingle = async (ticketId: string) => {
    setDeletingId(ticketId)
    startTransition(async () => {
      const result = await deleteTicket(ticketId)
      if (result.success) {
        toast.success(`Chamado #${result.ticketNumber} deletado com sucesso`)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao deletar chamado')
      }
      setDeletingId(null)
    })
  }
  
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      const result = await deleteMultipleTickets(ids)
      if (result.success) {
        toast.success(`${result.deleted} chamado(s) deletado(s) com sucesso`)
      } else {
        toast.warning(`${result.deleted} deletado(s), ${result.failed} falha(s)`)
        result.errors.forEach(err => toast.error(err))
      }
      setSelectedIds(new Set())
      router.refresh()
    })
  }
  
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum chamado disponível para deleção.
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="text-sm">
            {selectedIds.size} chamado(s) selecionado(s)
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Deletar Selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Deleção em Massa</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a deletar <strong>{selectedIds.size} chamado(s)</strong>.
                  Esta ação é permanente e não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Deletar {selectedIds.size} chamado(s)
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === tickets.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-24">#</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(ticket.id)}
                  onCheckedChange={() => toggleSelect(ticket.id)}
                />
              </TableCell>
              <TableCell className="font-mono">#{ticket.ticket_number}</TableCell>
              <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
              <TableCell>{ticket.department_name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
              </TableCell>
              <TableCell>{ticket.created_by_name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(ticket.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending && deletingId === ticket.id}
                    >
                      {isPending && deletingId === ticket.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a deletar o chamado <strong>#{ticket.ticket_number}</strong>: {ticket.title}.
                        <br /><br />
                        Esta ação é <strong>permanente</strong> e removerá todos os dados relacionados
                        (comentários, anexos, histórico, aprovações).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSingle(ticket.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar Chamado
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
