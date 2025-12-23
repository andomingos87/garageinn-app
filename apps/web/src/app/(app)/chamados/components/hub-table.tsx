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
import { StatusBadge, PriorityBadge, DepartmentBadge } from './status-badge'
import { FileText } from 'lucide-react'
import type { HubTicket } from '../actions'

/**
 * Obtém a rota de detalhes baseada no departamento
 */
function getTicketDetailRoute(departmentName: string, ticketId: string): string {
  const routeMap: Record<string, string> = {
    'Compras': `/chamados/compras/${ticketId}`,
    'Manutenção': `/chamados/manutencao/${ticketId}`,
    'RH': `/chamados/rh/${ticketId}`,
  }
  
  return routeMap[departmentName] || `/chamados/${ticketId}`
}

interface HubTableProps {
  tickets: HubTicket[]
}

export function HubTable({ tickets }: HubTableProps) {
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
        <CardTitle>Todos os Chamados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead className="hidden lg:table-cell">Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
                <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                <TableHead className="hidden md:table-cell text-right">Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const detailRoute = getTicketDetailRoute(ticket.department_name, ticket.id)
                
                return (
                  <TableRow key={ticket.id} className="group">
                    <TableCell className="font-mono text-muted-foreground">
                      <Link
                        href={detailRoute}
                        className="hover:text-primary transition-colors"
                      >
                        #{ticket.ticket_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={detailRoute}
                        className="block group-hover:text-primary transition-colors"
                      >
                        <div className="font-medium line-clamp-1">{ticket.title}</div>
                        {/* Show department on mobile */}
                        <div className="md:hidden mt-1">
                          <DepartmentBadge department={ticket.department_name} size="sm" />
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <DepartmentBadge department={ticket.department_name} size="sm" />
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
                      {ticket.assigned_to_name ? (
                        <span className="text-sm line-clamp-1">
                          {ticket.assigned_to_name.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

