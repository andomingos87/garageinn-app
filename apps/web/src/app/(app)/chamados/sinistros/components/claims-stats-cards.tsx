'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, Zap, CheckCircle2 } from 'lucide-react'
import type { ClaimStats } from '../actions'

interface ClaimsStatsCardsProps {
  stats: ClaimStats
}

export function ClaimsStatsCards({ stats }: ClaimsStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Sinistros',
      value: stats.total,
      icon: FileText,
      description: 'Todos os sinistros',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Aguardando Triagem',
      value: stats.awaitingTriage,
      icon: Clock,
      description: 'Aguardando análise inicial',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: Zap,
      description: 'Sendo processados',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Resolvidos',
      value: stats.resolved,
      icon: CheckCircle2,
      description: 'Finalizados',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
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

