import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle, XCircle, CarFront } from 'lucide-react'
import type { UnitsStats } from '../actions'

interface UnitsStatsCardsProps {
  stats: UnitsStats
}

export function UnitsStatsCards({ stats }: UnitsStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Unidades',
      value: stats.total,
      icon: Building2,
      description: 'unidades cadastradas',
      className: 'text-primary',
    },
    {
      title: 'Unidades Ativas',
      value: stats.active,
      icon: CheckCircle,
      description: 'em operação',
      className: 'text-emerald-600',
    },
    {
      title: 'Unidades Inativas',
      value: stats.inactive,
      icon: XCircle,
      description: 'desativadas',
      className: 'text-zinc-500',
    },
    {
      title: 'Capacidade Total',
      value: stats.totalCapacity.toLocaleString('pt-BR'),
      icon: CarFront,
      description: 'vagas disponíveis',
      className: 'text-blue-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.className}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

