import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ShoppingCart } from 'lucide-react'
import {
  getPurchaseTickets,
  getPurchaseStats,
  getPurchaseCategories,
  getUserUnits,
  type TicketFilters,
} from './actions'
import {
  TicketsStatsCards,
  TicketsFilters,
  TicketsTable,
  TicketsPagination,
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
async function TicketsStatsSection() {
  const stats = await getPurchaseStats()
  return <TicketsStatsCards stats={stats} />
}

async function TicketsFiltersSection() {
  const [categories, units] = await Promise.all([
    getPurchaseCategories(),
    getUserUnits(),
  ])
  return <TicketsFilters categories={categories} units={units} />
}

async function TicketsListSection({ filters }: { filters: TicketFilters }) {
  const result = await getPurchaseTickets(filters)
  
  return (
    <>
      <TicketsTable tickets={result.data} />
      <TicketsPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  )
}

export default async function ChamadosComprasPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const filters: TicketFilters = {
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
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Chamados de Compras</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Solicite materiais, equipamentos e compras em geral
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/compras/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <TicketsStatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <TicketsFiltersSection />
      </Suspense>

      {/* Tickets Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TicketsListSection filters={filters} />
      </Suspense>
    </div>
  )
}

