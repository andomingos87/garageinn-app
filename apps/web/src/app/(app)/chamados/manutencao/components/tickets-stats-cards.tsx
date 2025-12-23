'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, Zap, CheckCircle2 } from 'lucide-react'
import type { TicketStats } from '../actions'

interface TicketsStatsCardsProps {
  stats: TicketStats
}

export function TicketsStatsCards({ stats }: TicketsStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Chamados',
      value: stats.total,
      icon: FileText,
      description: 'Todos os chamados',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Aguardando Triagem',
      value: stats.awaitingTriage,
      icon: Clock,
      description: 'Aguardando análise',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: Zap,
      description: 'Sendo executados',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    {
      title: 'Concluídos',
      value: stats.closed,
      icon: CheckCircle2,
      description: 'Finalizados',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

