import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertTriangle } from 'lucide-react'
import {
  getClaimTickets,
  getClaimStats,
  getClaimCategories,
  getUserUnits,
  type ClaimFilters,
} from './actions'
import {
  ClaimsStatsCards,
  ClaimsFilters,
  ClaimsTable,
  ClaimsPagination,
} from './components'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    priority?: string
    category_id?: string
    unit_id?: string
    page?: string
  }>
}

// Loading skeleton components
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <Skeleton className="h-[400px] rounded-lg" />
  )
}

// Server components for data fetching
async function ClaimsStatsSection() {
  const stats = await getClaimStats()
  return <ClaimsStatsCards stats={stats} />
}

async function ClaimsFiltersSection() {
  const [categories, units] = await Promise.all([
    getClaimCategories(),
    getUserUnits(),
  ])
  return <ClaimsFilters categories={categories} units={units} />
}

async function ClaimsListSection({ filters }: { filters: ClaimFilters }) {
  const result = await getClaimTickets(filters)
  
  return (
    <>
      <ClaimsTable tickets={result.data} />
      <ClaimsPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  )
}

export default async function ChamadosSinistrosPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const filters: ClaimFilters = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    category_id: params.category_id,
    unit_id: params.unit_id,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-semibold tracking-tight">Sinistros</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe ocorrências de danos a veículos, estrutura e acidentes
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/sinistros/novo">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Sinistro
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <ClaimsStatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <ClaimsFiltersSection />
      </Suspense>

      {/* Claims Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ClaimsListSection filters={filters} />
      </Suspense>
    </div>
  )
}

