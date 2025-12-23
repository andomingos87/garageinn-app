import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck2,
  TrendingUp
} from 'lucide-react'
import type { ExecutionsStats } from '../actions'

interface ExecutionsStatsCardsProps {
  stats: ExecutionsStats
}

export function ExecutionsStatsCards({ stats }: ExecutionsStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Checklists executados</p>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0
              ? `${((stats.completed / stats.total) * 100).toFixed(0)}% do total`
              : 'Nenhum registro'}
          </p>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
        </CardContent>
      </Card>

      {/* Non-conformities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Não-Conformidades</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.withNonConformities}</div>
          <p className="text-xs text-muted-foreground">Com pendências</p>
        </CardContent>
      </Card>

      {/* Conformity Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa Conformidade</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conformityRate}%</div>
          <p className="text-xs text-muted-foreground">Concluídos sem pendências</p>
        </CardContent>
      </Card>
    </div>
  )
}

