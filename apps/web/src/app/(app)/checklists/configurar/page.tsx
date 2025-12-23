import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { getTemplates, getTemplatesStats, checkIsAdmin } from './actions'
import {
  TemplatesFilters,
  TemplatesGrid,
  TemplatesStatsCards,
} from './components'
import type { TemplateFilters } from './actions'

interface PageProps {
  searchParams: Promise<{
    search?: string
    type?: string
    status?: string
  }>
}

async function TemplatesContent({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const params = await searchParams

  const filters: TemplateFilters = {
    search: params.search,
    type: (params.type as TemplateFilters['type']) || 'all',
    status: (params.status as TemplateFilters['status']) || 'all',
  }

  const [templates, stats] = await Promise.all([
    getTemplates(filters),
    getTemplatesStats(),
  ])

  return (
    <>
      {/* Stats Cards */}
      <TemplatesStatsCards stats={stats} />

      {/* Templates List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Templates de Checklist</CardTitle>
          </div>
          <div className="pt-4">
            <TemplatesFilters />
          </div>
        </CardHeader>
        <CardContent>
          <TemplatesGrid templates={templates} />
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
          <div className="pt-4 flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="border-t pt-3 flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
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

export default async function ConfigurarChecklistsPage({ searchParams }: PageProps) {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Configurar Checklists
          </h2>
          <p className="text-muted-foreground">
            Gerencie templates e perguntas de checklists
          </p>
        </div>
        <Button asChild>
          <Link href="/checklists/configurar/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <TemplatesContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

