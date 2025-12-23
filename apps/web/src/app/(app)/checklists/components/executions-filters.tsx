'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, X, AlertTriangle } from 'lucide-react'

interface Unit {
  id: string
  name: string
  code: string
}

interface Template {
  id: string
  name: string
  type: string
}

interface ExecutionsFiltersProps {
  units: Unit[]
  templates: Template[]
}

export function ExecutionsFilters({ units, templates }: ExecutionsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const unitId = searchParams.get('unitId') || 'all'
  const templateId = searchParams.get('templateId') || 'all'
  const status = searchParams.get('status') || 'all'
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const hasNonConformities = searchParams.get('hasNonConformities') === 'true'

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset page when filters change
      params.delete('page')

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || value === 'false') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ [key]: value })
      router.push(`/checklists${queryString ? `?${queryString}` : ''}`)
    })
  }

  const handleClearFilters = () => {
    startTransition(() => {
      router.push('/checklists')
    })
  }

  const hasActiveFilters =
    unitId !== 'all' ||
    templateId !== 'all' ||
    status !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    hasNonConformities

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Unit Filter */}
        <Select
          value={unitId}
          onValueChange={(value) => handleFilterChange('unitId', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as unidades</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Template Filter */}
        <Select
          value={templateId}
          onValueChange={(value) => handleFilterChange('templateId', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os templates</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => handleFilterChange('status', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Date Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Start Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="startDate" className="text-sm text-muted-foreground whitespace-nowrap">
            De:
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-[160px]"
            disabled={isPending}
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2">
          <Label htmlFor="endDate" className="text-sm text-muted-foreground whitespace-nowrap">
            Até:
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-[160px]"
            disabled={isPending}
          />
        </div>

        {/* Non-conformities Toggle */}
        <div className="flex items-center gap-2 ml-0 sm:ml-4">
          <Switch
            id="hasNonConformities"
            checked={hasNonConformities}
            onCheckedChange={(checked) =>
              handleFilterChange('hasNonConformities', checked ? 'true' : 'false')
            }
            disabled={isPending}
          />
          <Label
            htmlFor="hasNonConformities"
            className="text-sm flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Apenas com não-conformidades
          </Label>
        </div>
      </div>
    </div>
  )
}

