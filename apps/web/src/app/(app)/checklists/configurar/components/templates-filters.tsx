'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'

export function TemplatesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const type = searchParams.get('type') || 'all'
  const status = searchParams.get('status') || 'all'

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`?${createQueryString({ search })}`)
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(`?${createQueryString({ [key]: value })}`)
    })
  }

  const handleClearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/checklists/configurar')
    })
  }

  const hasFilters = search || type !== 'all' || status !== 'all'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            disabled={isPending}
          />
        </div>
      </form>

      <Select
        value={type}
        onValueChange={(value) => handleFilterChange('type', value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="opening">Abertura</SelectItem>
          <SelectItem value="supervision">Supervisão</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          disabled={isPending}
          className="shrink-0"
        >
          <X className="mr-1 h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  )
}

