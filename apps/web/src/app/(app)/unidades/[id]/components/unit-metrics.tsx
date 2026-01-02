'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Ticket, 
  CheckSquare, 
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import type { UnitMetrics } from '../../actions'

interface UnitMetricsCardProps {
  metrics: UnitMetrics
}

export function UnitMetricsCard({ metrics }: UnitMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Métricas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chamados */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Ticket className="h-4 w-4" />
            Chamados
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-lg font-bold">{metrics.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <p className="text-lg font-bold text-yellow-600">{metrics.openTickets}</p>
              <p className="text-xs text-muted-foreground">Abertos</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2">
              <p className="text-lg font-bold text-green-600">{metrics.resolvedTickets}</p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </div>

        {/* Checklists */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-lg font-bold">{metrics.completedChecklists}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <p className="text-lg font-bold text-blue-600">{metrics.checklistsThisMonth}</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </div>
          </div>
        </div>

        {/* Taxa de não-conformidade */}
        {metrics.totalChecklists > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Não-conformidades</span>
            </div>
            <span className={`font-medium ${
              metrics.nonConformityRate > 20 ? 'text-red-500' : 'text-green-500'
            }`}>
              {metrics.nonConformityRate}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}









