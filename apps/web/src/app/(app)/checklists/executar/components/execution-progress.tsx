'use client'

import { cn } from '@/lib/utils'

interface ExecutionProgressProps {
  current: number
  total: number
  className?: string
}

export function ExecutionProgress({ current, total, className }: ExecutionProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {current} de {total} {total === 1 ? 'respondida' : 'respondidas'}
        </span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            percentage === 100 ? 'bg-success' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

