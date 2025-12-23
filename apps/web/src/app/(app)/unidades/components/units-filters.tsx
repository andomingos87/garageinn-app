'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface UnitsFiltersProps {
  cities: string[]
  regions: string[]
}

export function UnitsFilters({ cities, regions }: UnitsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const city = searchParams.get('city') || 'all'
  const region = searchParams.get('region') || 'all'

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      return params.toString()
    },
    [searchParams]
  )

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ search: value || null })
      router.push(`/unidades${queryString ? `?${queryString}` : ''}`)
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ [key]: value })
      router.push(`/unidades${queryString ? `?${queryString}` : ''}`)
    })
  }

  const handleClearFilters = () => {
    startTransition(() => {
      router.push('/unidades')
    })
  }

  const hasActiveFilters = search || status !== 'all' || city !== 'all' || region !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, código ou endereço..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          disabled={isPending}
        />
      </div>

      {/* Status Filter */}
      <Select
        value={status}
        onValueChange={(value) => handleFilterChange('status', value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="inactive">Inativas</SelectItem>
        </SelectContent>
      </Select>

      {/* City Filter */}
      {cities.length > 0 && (
        <Select
          value={city}
          onValueChange={(value) => handleFilterChange('city', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Region Filter */}
      {regions.length > 0 && (
        <Select
          value={region}
          onValueChange={(value) => handleFilterChange('region', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as regiões</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearFilters}
          disabled={isPending}
          title="Limpar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

