import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertTriangle, 
  Settings,
  Building2,
  User,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from './configurar/actions'

interface ExecutionWithDetails {
  id: string
  started_at: string
  completed_at: string | null
  status: string
  has_non_conformities: boolean | null
  unit_name: string | null
  unit_code: string | null
  template_name: string | null
  template_type: string | null
  executed_by_name: string | null
  non_conformities_count: number | null
  total_answers: number | null
}

async function getTodayExecutions(): Promise<ExecutionWithDetails[]> {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('checklist_executions_with_details')
    .select('*')
    .gte('started_at', `${today}T00:00:00`)
    .lt('started_at', `${today}T23:59:59`)
    .order('started_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching executions:', error)
    return []
  }
  
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  
  // Today's executions
  const { data: todayData } = await supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities')
    .gte('started_at', `${today}T00:00:00`)
    .lt('started_at', `${today}T23:59:59`)
  
  // Week's executions
  const { data: weekData } = await supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities')
    .gte('started_at', weekStart.toISOString())
  
  const todayCompleted = todayData?.filter(e => e.status === 'completed').length || 0
  const todayTotal = todayData?.length || 0
  const weekCompleted = weekData?.filter(e => e.status === 'completed').length || 0
  const weekTotal = weekData?.length || 0
  const weekNonConformities = weekData?.filter(e => e.has_non_conformities).length || 0
  
  return {
    todayCompleted,
    todayTotal,
    weekCompletionRate: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
    weekNonConformities,
  }
}

function getStatusIcon(status: string, hasNonConformities: boolean | null) {
  if (status === 'completed') {
    if (hasNonConformities) {
      return <AlertTriangle className="h-4 w-4 text-warning" />
    }
    return <CheckCircle2 className="h-4 w-4 text-success" />
  }
  if (status === 'in_progress') {
    return <PlayCircle className="h-4 w-4 text-info" />
  }
  return <Clock className="h-4 w-4 text-muted-foreground" />
}

function getStatusBadge(status: string, hasNonConformities: boolean | null) {
  if (status === 'completed') {
    if (hasNonConformities) {
      return (
        <Badge variant="outline" className="text-warning border-warning/30">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Com pendências
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-success/10 text-success border-success/20">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Concluído
      </Badge>
    )
  }
  if (status === 'in_progress') {
    return (
      <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
        <Clock className="mr-1 h-3 w-3" />
        Em andamento
      </Badge>
    )
  }
  return <Badge variant="outline">Pendente</Badge>
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function StatsCards() {
  const stats = await getStats()
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayCompleted}/{stats.todayTotal}</div>
          <p className="text-xs text-muted-foreground">
            Checklists concluídos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Esta Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weekCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Não-Conformidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weekNonConformities}</div>
          <p className="text-xs text-muted-foreground">Na última semana</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function ExecutionsList() {
  const executions = await getTodayExecutions()
  
  if (executions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checklists de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Nenhum checklist executado hoje ainda.
            </p>
            <Button asChild className="mt-4">
              <Link href="/checklists/executar">
                <PlayCircle className="mr-2 h-4 w-4" />
                Iniciar Checklist
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklists de Hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                {getStatusIcon(item.status, item.has_non_conformities)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.unit_name}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {item.unit_code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.template_name}</span>
                    <span>•</span>
                    <span>{formatTime(item.started_at)}</span>
                    {item.non_conformities_count && item.non_conformities_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-destructive flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {item.non_conformities_count} {item.non_conformities_count === 1 ? 'não-conformidade' : 'não-conformidades'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {item.executed_by_name && (
                  <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.executed_by_name}
                  </span>
                )}
                {getStatusBadge(item.status, item.has_non_conformities)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default async function ChecklistsPage() {
  const isAdmin = await checkIsAdmin()
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">
            Checklists de abertura e supervisão das unidades
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href="/checklists/configurar">
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/checklists/executar">
              <PlayCircle className="mr-2 h-4 w-4" />
              Executar Checklist
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <StatsCards />
        <ExecutionsList />
      </Suspense>
    </div>
  )
}
