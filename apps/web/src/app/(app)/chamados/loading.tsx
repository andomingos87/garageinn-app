import { Skeleton } from '@/components/ui/skeleton'

export default function ChamadosLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="hidden lg:flex items-center gap-2">
          <Skeleton className="h-10 w-[160px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}

