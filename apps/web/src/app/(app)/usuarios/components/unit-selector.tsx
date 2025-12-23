'use client'

import { Badge } from '@/components/ui/badge'
import { Check, Building2, X } from 'lucide-react'
import type { UnitOption } from '../actions'

interface SelectedUnit {
  unitId: string
  isCoverage: boolean
}

interface UnitSelectorProps {
  units: UnitOption[]
  selectedUnits: SelectedUnit[]
  onChange: (units: SelectedUnit[]) => void
  mode: 'single' | 'multiple'
  label?: string
  description?: string
}

export function UnitSelector({
  units,
  selectedUnits,
  onChange,
  mode,
  label = 'Unidade(s)',
  description,
}: UnitSelectorProps) {
  const isSelected = (unitId: string) =>
    selectedUnits.some((u) => u.unitId === unitId)

  function handleToggle(unitId: string) {
    if (mode === 'single') {
      // Single mode: toggle or replace selection
      if (isSelected(unitId)) {
        onChange([])
      } else {
        onChange([{ unitId, isCoverage: false }])
      }
    } else {
      // Multiple mode: add or remove from selection
      if (isSelected(unitId)) {
        onChange(selectedUnits.filter((u) => u.unitId !== unitId))
      } else {
        onChange([...selectedUnits, { unitId, isCoverage: true }])
      }
    }
  }

  function handleRemove(unitId: string) {
    onChange(selectedUnits.filter((u) => u.unitId !== unitId))
  }

  const selectedUnitDetails = selectedUnits
    .map((su) => {
      const unit = units.find((u) => u.id === su.unitId)
      return unit ? { ...unit, isCoverage: su.isCoverage } : null
    })
    .filter((u): u is UnitOption & { isCoverage: boolean } => u !== null)

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Selected Units Display */}
      {selectedUnitDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
          {selectedUnitDetails.map((unit) => (
            <Badge
              key={unit.id}
              variant="secondary"
              className="flex items-center gap-1.5 pr-1"
            >
              <span className="text-xs font-mono text-muted-foreground">
                {unit.code}
              </span>
              <span>{unit.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(unit.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Units Grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => {
          const selected = isSelected(unit.id)
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => handleToggle(unit.id)}
              className={`
                flex items-start gap-3 p-3 rounded-lg border text-left transition-all
                ${
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                }
              `}
            >
              <div
                className={`
                  mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border
                  ${
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  }
                `}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm leading-tight">{unit.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {unit.code}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {units.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma unidade disponível
        </p>
      )}

      {selectedUnits.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedUnits.length} unidade(s) selecionada(s)
          {mode === 'multiple' && ' (cobertura)'}
        </p>
      )}
    </div>
  )
}

