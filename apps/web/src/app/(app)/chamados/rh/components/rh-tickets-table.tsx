'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge, PriorityBadge, UrgencyBadge } from '../../compras/components/status-badge'
import { ClipboardList } from 'lucide-react'

interface RHTicketsTableProps {
  tickets: any[]
}

export function RHTicketsTable({ tickets }: RHTicketsTableProps) {
  const router = useRouter()

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Não há chamados de RH para exibir com os filtros atuais.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Número</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Urgência</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/chamados/rh/${ticket.id}`)}
            >
              <TableCell className="font-medium">#{ticket.ticket_number}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{ticket.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {ticket.category_name || 'Sem categoria'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {ticket.unit_code ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.unit_code}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {ticket.unit_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Global</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell>
                <UrgencyBadge urgency={ticket.perceived_urgency} />
              </TableCell>
              <TableCell>
                {ticket.created_at && format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

