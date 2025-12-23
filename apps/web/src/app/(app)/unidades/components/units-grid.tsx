'use client'

import { useState, useTransition } from 'react'
import { UnitCard } from './unit-card'
import { updateUnitStatus } from '../actions'
import type { UnitWithStaffCount, UnitStatus } from '@/lib/supabase/database.types'

interface UnitsGridProps {
  units: UnitWithStaffCount[]
  isAdmin: boolean
}

export function UnitsGrid({ units, isAdmin }: UnitsGridProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticUnits, setOptimisticUnits] = useState(units)

  // Atualizar quando units mudar
  if (units !== optimisticUnits && !isPending) {
    setOptimisticUnits(units)
  }

  const handleToggleStatus = (unitId: string, newStatus: UnitStatus) => {
    // Atualização otimista
    setOptimisticUnits((current) =>
      current.map((unit) =>
        unit.id === unitId ? { ...unit, status: newStatus } : unit
      )
    )

    startTransition(async () => {
      const result = await updateUnitStatus(unitId, newStatus)
      
      if (result.error) {
        // Reverter em caso de erro
        setOptimisticUnits((current) =>
          current.map((unit) =>
            unit.id === unitId
              ? { ...unit, status: newStatus === 'active' ? 'inactive' : 'active' }
              : unit
          )
        )
      }
    })
  }

  if (optimisticUnits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Nenhuma unidade encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tente ajustar os filtros ou criar uma nova unidade.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {optimisticUnits.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          isAdmin={isAdmin}
          onToggleStatus={handleToggleStatus}
        />
      ))}
    </div>
  )
}

