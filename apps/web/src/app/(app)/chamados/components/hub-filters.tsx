'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { STATUS_LABELS, PRIORITY_LABELS } from './status-badge'
import type { Department, Unit } from '../actions'

interface HubFiltersProps {
  departments: Department[]
  units: Unit[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'awaiting_triage', label: STATUS_LABELS['awaiting_triage'] },
  { value: 'in_progress', label: STATUS_LABELS['in_progress'] },
  { value: 'quoting', label: STATUS_LABELS['quoting'] },
  { value: 'approved', label: STATUS_LABELS['approved'] },
  { value: 'executing', label: STATUS_LABELS['executing'] },
  { value: 'resolved', label: STATUS_LABELS['resolved'] },
  { value: 'closed', label: STATUS_LABELS['closed'] },
  { value: 'cancelled', label: STATUS_LABELS['cancelled'] },
  { value: 'denied', label: STATUS_LABELS['denied'] },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Todas prioridades' },
  { value: 'low', label: PRIORITY_LABELS['low'] },
  { value: 'medium', label: PRIORITY_LABELS['medium'] },
  { value: 'high', label: PRIORITY_LABELS['high'] },
  { value: 'urgent', label: PRIORITY_LABELS['urgent'] },
]

export function HubFilters({ departments, units }: HubFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Current filter values
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const priority = searchParams.get('priority') || 'all'
  const department_id = searchParams.get('department_id') || 'all'
  const unit_id = searchParams.get('unit_id') || 'all'

  const [localSearch, setLocalSearch] = useState(search)

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    startTransition(() => {
      router.push(`/chamados?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearch = () => {
    updateFilters({ search: localSearch })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setLocalSearch('')
    startTransition(() => {
      router.push('/chamados')
    })
  }

  const hasActiveFilters = search || status !== 'all' || priority !== 'all' || department_id !== 'all' || unit_id !== 'all'
  const activeFilterCount = [search, status !== 'all', priority !== 'all', department_id !== 'all', unit_id !== 'all'].filter(Boolean).length

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou #número..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            disabled={isPending}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary" disabled={isPending}>
          Buscar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-2">
          <Select
            value={department_id}
            onValueChange={(value) => updateFilters({ department_id: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => updateFilters({ status: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
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
            value={priority}
            onValueChange={(value) => updateFilters({ priority: value })}
            disabled={isPending}
          >
            <SelectTrigger className="w-[160px]">
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
        </div>

        {/* Mobile Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Refine a listagem de chamados
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={department_id}
                  onValueChange={(value) => {
                    updateFilters({ department_id: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    updateFilters({ status: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => {
                    updateFilters({ priority: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={unit_id}
                  onValueChange={(value) => {
                    updateFilters({ unit_id: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas unidades</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters()
                    setIsOpen(false)
                  }}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={isPending}
            className="hidden lg:flex"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}

