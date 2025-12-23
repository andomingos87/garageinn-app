'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface ExecutionsPaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
}

export function ExecutionsPagination({
  page,
  totalPages,
  total,
  limit,
}: ExecutionsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'checklist encontrado' : 'checklists encontrados'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {total} {total === 1 ? 'checklist' : 'checklists'}
      </p>

      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => router.push(createPageURL(1))}
          title="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => router.push(createPageURL(page - 1))}
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push(createPageURL(pageNum as number))}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => router.push(createPageURL(page + 1))}
          title="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => router.push(createPageURL(totalPages))}
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | string)[] {
  const pages: (number | string)[] = []
  const showPages = 5

  if (totalPages <= showPages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (currentPage <= 3) {
      for (let i = 2; i <= Math.min(showPages, totalPages - 1); i++) {
        pages.push(i)
      }
      pages.push('...')
    } else if (currentPage >= totalPages - 2) {
      pages.push('...')
      for (let i = totalPages - showPages + 1; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
    }

    pages.push(totalPages)
  }

  return pages
}

