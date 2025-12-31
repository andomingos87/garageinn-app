import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus } from 'lucide-react'
import { getUsers, getUsersStatsExtended, getDepartments, checkIsAdmin } from './actions'
import { UsersTable, UsersFilters, UserStatsCards, UsersPagination } from './components'
import type { UserStatus } from '@/lib/supabase/custom-types'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    department?: string
    page?: string
    limit?: string
  }>
}

async function UsersContent({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const params = await searchParams
  
  const filters = {
    search: params.search,
    status: (params.status || 'all') as UserStatus | 'all',
    departmentId: params.department,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  }

  const [paginatedUsers, stats, departments] = await Promise.all([
    getUsers(filters),
    getUsersStatsExtended(),
    getDepartments(),
  ])

  return (
    <>
      {/* Stats Cards */}
      <UserStatsCards stats={stats} />

      {/* Users List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Todos os Usuários</CardTitle>
          </div>
          <div className="pt-4">
            <UsersFilters departments={departments} />
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable users={paginatedUsers.users} />
          <UsersPagination
            page={paginatedUsers.page}
            totalPages={paginatedUsers.totalPages}
            total={paginatedUsers.total}
            limit={paginatedUsers.limit}
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
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Table Skeleton */}
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
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  // Verificar se o usuário é admin
  const isAdmin = await checkIsAdmin()
  
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
