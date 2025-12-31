import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Upload, Link2 } from 'lucide-react'
import { getUnits, getUnitsStats, getCities, getRegions, checkIsAdmin, countUnlinkedSupervisors } from './actions'
import { UnitsFilters, UnitsGrid, UnitsStatsCards } from './components'
import type { UnitStatus } from '@/lib/supabase/custom-types'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    city?: string
    region?: string
  }>
}

async function UnitsContent({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const params = await searchParams
  const isAdmin = await checkIsAdmin()

  const filters = {
    search: params.search,
    status: (params.status || 'all') as UnitStatus | 'all',
    city: params.city,
    region: params.region,
  }

  const [units, stats, cities, regions] = await Promise.all([
    getUnits(filters),
    getUnitsStats(),
    getCities(),
    getRegions(),
  ])

  return (
    <>
      {/* Stats Cards */}
      <UnitsStatsCards stats={stats} />

      {/* Units List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todas as Unidades</CardTitle>
          </div>
          <div className="pt-4">
            <UnitsFilters cities={cities} regions={regions} />
          </div>
        </CardHeader>
        <CardContent>
          <UnitsGrid units={units} isAdmin={isAdmin} />
        </CardContent>
      </Card>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
          <div className="pt-4 flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default async function UnidadesPage({ searchParams }: PageProps) {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  // Check if there are supervisors that can be linked
  const unlinkedSupervisorsCount = await countUnlinkedSupervisors()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Unidades</h2>
          <p className="text-muted-foreground">
            Gerencie as unidades da rede Garageinn
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unlinkedSupervisorsCount > 0 && (
            <Button variant="outline" asChild>
              <Link href="/unidades/vincular-supervisores">
                <Link2 className="mr-2 h-4 w-4" />
                Vincular Supervisores
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/unidades/importar">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/unidades/novo">
              <Plus className="mr-2 h-4 w-4" />
              Nova Unidade
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <UnitsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
