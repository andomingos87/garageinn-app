import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Ticket } from 'lucide-react'
import {
  getHubTickets,
  getHubStats,
  getDepartments,
  getUnits,
  type HubTicketFilters,
} from './actions'
import {
  HubStatsCards,
  HubFilters,
  HubTable,
  HubPagination,
  NewTicketDialog,
} from './components'

interface PageProps {
  searchParams: Promise<{
    search?: string
    department_id?: string
    status?: string
    priority?: string
    unit_id?: string
    page?: string
  }>
}

// Loading skeletons
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="hidden lg:flex items-center gap-2">
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[160px]" />
      </div>
    </div>
  )
}

function TableSkeleton() {
  return <Skeleton className="h-[400px] rounded-lg" />
}

// Server components for data fetching
async function StatsSection() {
  const stats = await getHubStats()
  return <HubStatsCards stats={stats} />
}

async function FiltersSection() {
  const [departments, units] = await Promise.all([
    getDepartments(),
    getUnits(),
  ])
  return <HubFilters departments={departments} units={units} />
}

async function TicketsListSection({ filters }: { filters: HubTicketFilters }) {
  const result = await getHubTickets(filters)
  
  return (
    <>
      <HubTable tickets={result.data} />
      <HubPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  )
}

export default async function ChamadosHubPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const filters: HubTicketFilters = {
    search: params.search,
    department_id: params.department_id,
    status: params.status,
    priority: params.priority,
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
            <Ticket className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Chamados</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Hub central de chamados de todos os departamentos
          </p>
        </div>
        <NewTicketDialog />
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <FiltersSection />
      </Suspense>

      {/* Tickets Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TicketsListSection filters={filters} />
      </Suspense>
    </div>
  )
}
