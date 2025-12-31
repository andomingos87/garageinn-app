'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, ArrowUp, RefreshCw, FileText } from 'lucide-react'
import type { UniformTransaction } from '../actions'
import Link from 'next/link'

interface TransactionsTableProps {
  transactions: UniformTransaction[]
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  entrada: { label: 'Entrada', icon: ArrowDown, color: 'text-green-600', badgeVariant: 'secondary' },
  saida: { label: 'Saída', icon: ArrowUp, color: 'text-red-600', badgeVariant: 'destructive' },
  ajuste: { label: 'Ajuste', icon: RefreshCw, color: 'text-blue-600', badgeVariant: 'outline' },
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          Nenhuma movimentação registrada
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Uniforme</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-center">Qtd</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Chamado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => {
          const config = typeConfig[t.type] || typeConfig.ajuste
          const Icon = config.icon
          
          return (
            <TableRow key={t.id}>
              <TableCell className="text-sm">
                {new Date(t.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell>
                <span className="font-medium">{t.uniform_name}</span>
                {t.uniform_size && (
                  <span className="text-muted-foreground ml-1">({t.uniform_size})</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={config.badgeVariant} className="gap-1">
                  <Icon className={`h-3 w-3 ${config.color}`} />
                  {config.label}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-semibold">
                {t.type === 'saida' ? '-' : '+'}{t.quantity}
              </TableCell>
              <TableCell className="text-sm">
                {t.user_name || '-'}
              </TableCell>
              <TableCell className="text-sm">
                {t.unit_name || '-'}
              </TableCell>
              <TableCell>
                {t.ticket_number ? (
                  <Link 
                    href={`/chamados/rh/${t.ticket_id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    #{t.ticket_number}
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

