'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge, PriorityBadge } from './status-badge'
import { Badge } from '@/components/ui/badge'
import { FileText, MessageSquare, Paperclip } from 'lucide-react'

interface Ticket {
  id: string
  ticket_number: number
  title: string
  status: string
  priority: string | null
  perceived_urgency: string | null
  created_at: string
  category_name: string | null
  unit_name: string | null
  unit_code: string | null
  item_name: string | null
  quantity: number | null
  unit_of_measure: string | null
  created_by_id: string
  created_by_name: string
  created_by_avatar: string | null
  comments_count: number | null
  attachments_count: number | null
}

interface TicketsTableProps {
  tickets: Ticket[]
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste os filtros ou crie um novo chamado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados de Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Título / Item</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
                <TableHead className="hidden lg:table-cell">Solicitante</TableHead>
                <TableHead className="hidden md:table-cell text-right">Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
                  <TableCell className="font-mono text-muted-foreground">
                    <Link
                      href={`/chamados/compras/${ticket.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      #{ticket.ticket_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/chamados/compras/${ticket.id}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <div className="font-medium line-clamp-1">{ticket.title}</div>
                      {ticket.item_name && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.item_name}
                          {ticket.quantity && (
                            <span className="ml-1">
                              ({ticket.quantity} {ticket.unit_of_measure || 'un'})
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                        {(ticket.comments_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.comments_count}
                          </span>
                        )}
                        {(ticket.attachments_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <Paperclip className="h-3 w-3" />
                            {ticket.attachments_count}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ticket.category_name ? (
                      <Badge variant="outline" className="font-normal">
                        {ticket.category_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.unit_code ? (
                      <span className="text-sm">
                        <span className="font-mono text-muted-foreground">{ticket.unit_code}</span>
                        {ticket.unit_name && (
                          <span className="hidden xl:inline ml-1 text-muted-foreground">
                            - {ticket.unit_name}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} size="sm" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PriorityBadge priority={ticket.priority} size="sm" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={ticket.created_by_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {ticket.created_by_name?.slice(0, 2).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm line-clamp-1">
                        {ticket.created_by_name?.split(' ')[0] || 'Desconhecido'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(ticket.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

