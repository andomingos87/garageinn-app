'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RHCategory } from '../actions'
import type { UserUnit } from '../../compras/actions'

interface RHTicketsFiltersProps {
  categories: RHCategory[]
  units: UserUnit[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'awaiting_triage', label: 'Aguardando Triagem' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
  { value: 'denied', label: 'Negado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Todas as Prioridades' },
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

export function RHTicketsFilters({ categories, units }: RHTicketsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === 'all' || value === '') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      }

      // Resetar página ao filtrar
      if (!params.page) {
        newSearchParams.delete('page')
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name: string, value: string) => {
    const query = createQueryString({ [name]: value })
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleClearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou título..."
            className="pl-8"
            defaultValue={searchParams.get('search') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilterChange('search', e.currentTarget.value)
              }
            }}
          />
        </div>

        <Select
          defaultValue={searchParams.get('status') || 'all'}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('priority') || 'all'}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('category_id') || 'all'}
          onValueChange={(value) => handleFilterChange('category_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('unit_id') || 'all'}
          onValueChange={(value) => handleFilterChange('unit_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Unidades</SelectItem>
            <SelectItem value="global">Global (Sem unidade)</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.code} - {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3 text-xs"
          >
            Limpar Filtros
            <X className="ml-2 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

