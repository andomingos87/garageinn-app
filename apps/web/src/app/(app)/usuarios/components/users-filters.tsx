'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X } from 'lucide-react'

interface Department {
  id: string
  name: string
}

interface UsersFiltersProps {
  departments: Department[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'inactive', label: 'Inativos' },
]

export function UsersFilters({ departments }: UsersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'all'
  const currentDepartment = searchParams.get('department') || 'all'

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === 'all') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      startTransition(() => {
        router.push(`/usuarios?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // Debounce implementado via timeout
      const timeoutId = setTimeout(() => {
        updateSearchParams({ search: value || null })
      }, 300)
      return () => clearTimeout(timeoutId)
    },
    [updateSearchParams]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      updateSearchParams({ status: value })
    },
    [updateSearchParams]
  )

  const handleDepartmentChange = useCallback(
    (value: string) => {
      updateSearchParams({ department: value })
    },
    [updateSearchParams]
  )

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push('/usuarios')
    })
  }, [router])

  const hasActiveFilters = currentSearch || currentStatus !== 'all' || currentDepartment !== 'all'

  const getStatusLabel = () => {
    const option = STATUS_OPTIONS.find(o => o.value === currentStatus)
    return option?.label || 'Status'
  }

  const getDepartmentLabel = () => {
    if (currentDepartment === 'all') return 'Departamento'
    const dept = departments.find(d => d.id === currentDepartment)
    return dept?.name || 'Departamento'
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome ou email..."
          defaultValue={currentSearch}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[130px]">
            <span className={currentStatus !== 'all' ? 'text-foreground' : 'text-muted-foreground'}>
              {getStatusLabel()}
            </span>
            <Filter className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuRadioGroup value={currentStatus} onValueChange={handleStatusChange}>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Department Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[160px]">
            <span className={currentDepartment !== 'all' ? 'text-foreground' : 'text-muted-foreground'}>
              {getDepartmentLabel()}
            </span>
            <Filter className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuRadioGroup value={currentDepartment} onValueChange={handleDepartmentChange}>
            <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
            {departments.map((dept) => (
              <DropdownMenuRadioItem key={dept.id} value={dept.id}>
                {dept.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="shrink-0"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar filtros</span>
        </Button>
      )}
    </div>
  )
}

