import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PlayCircle, Settings, History } from 'lucide-react'
import {
  getExecutions,
  getExecutionsStats,
  getUnitsForFilter,
  getTemplatesForFilter,
  checkIsAdmin,
} from './actions'
import {
  ExecutionsFilters,
  ExecutionsStatsCards,
  ExecutionsTable,
  ExecutionsPagination,
} from './components'
import type { ExecutionsFilters as ExecutionsFiltersType } from './actions'

interface PageProps {
  searchParams: Promise<{
    unitId?: string
    templateId?: string
    startDate?: string
    endDate?: string
    status?: string
    hasNonConformities?: string
    page?: string
  }>
}

async function ChecklistsContent({
  searchParams,
}: {
  searchParams: PageProps['searchParams']
}) {
  const params = await searchParams
  const isAdmin = await checkIsAdmin()

  const filters: ExecutionsFiltersType = {
    unitId: params.unitId,
    templateId: params.templateId,
    startDate: params.startDate,
    endDate: params.endDate,
    status: (params.status as 'all' | 'in_progress' | 'completed') || 'all',
    hasNonConformities: params.hasNonConformities === 'true',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
  }

  const [executionsResult, stats, units, templates] = await Promise.all([
    getExecutions(filters),
    getExecutionsStats({
      unitId: params.unitId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getUnitsForFilter(),
    getTemplatesForFilter(),
  ])

  return (
    <>
      {/* Stats Cards */}
      <ExecutionsStatsCards stats={stats} />

      {/* Executions List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Execuções
            </CardTitle>
          </div>
          <div className="pt-4">
            <ExecutionsFilters units={units} templates={templates} />
          </div>
        </CardHeader>
        <CardContent>
          <ExecutionsTable executions={executionsResult.data} isAdmin={isAdmin} />
          <ExecutionsPagination
            page={executionsResult.page}
            totalPages={executionsResult.totalPages}
            total={executionsResult.count}
            limit={executionsResult.limit}
          />
        </CardContent>
      </Card>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
          <div className="pt-4 space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-10 w-[160px]" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[160px]" />
              <Skeleton className="h-10 w-[160px]" />
              <Skeleton className="h-6 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default async function ChecklistsPage({ searchParams }: PageProps) {
  const isAdmin = await checkIsAdmin()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">
            Histórico e execução de checklists de abertura e supervisão
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
        <ChecklistsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
