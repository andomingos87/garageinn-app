'use client'

import { Badge } from '@/components/ui/badge'
import type { UnitStatus } from '@/lib/supabase/database.types'

interface UnitStatusBadgeProps {
  status: UnitStatus
}

const statusConfig: Record<UnitStatus, { label: string; className: string }> = {
  active: {
    label: 'Ativa',
    className: 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400',
  },
  inactive: {
    label: 'Inativa',
    className: 'bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/20 dark:text-zinc-400',
  },
}

export function UnitStatusBadge({ status }: UnitStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

