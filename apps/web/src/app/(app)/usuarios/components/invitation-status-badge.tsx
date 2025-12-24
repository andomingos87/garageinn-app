'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Clock, CheckCircle2, AlertCircle, Mail } from 'lucide-react'
import type { InvitationStatus } from '@/lib/supabase/database.types'

interface InvitationStatusBadgeProps {
  status: InvitationStatus
  sentAt?: string | null
  expiresAt?: string | null
  compact?: boolean
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff <= 0) return 'Expirado'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h restantes`
  if (hours > 0) return `${hours}h restantes`
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${minutes}min restantes`
}

const statusConfig: Record<InvitationStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
  icon: typeof Clock
  description: string
}> = {
  not_sent: {
    label: 'Não enviado',
    variant: 'outline',
    className: 'border-muted-foreground/30 text-muted-foreground',
    icon: Mail,
    description: 'O convite ainda não foi enviado para este usuário',
  },
  pending: {
    label: 'Aguardando',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Clock,
    description: 'Convite enviado, aguardando aceitação',
  },
  expired: {
    label: 'Expirado',
    variant: 'destructive',
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
    description: 'O convite expirou e precisa ser reenviado',
  },
  accepted: {
    label: 'Aceito',
    variant: 'default',
    className: 'bg-success hover:bg-success/90',
    icon: CheckCircle2,
    description: 'Convite aceito, usuário ativo',
  },
}

export function InvitationStatusBadge({ 
  status, 
  sentAt, 
  expiresAt,
  compact = false 
}: InvitationStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const badge = (
    <Badge 
      variant={config.variant} 
      className={`${config.className} gap-1 ${compact ? 'px-1.5 py-0.5 text-xs' : ''}`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {!compact && config.label}
    </Badge>
  )

  // Se compacto, mostrar tooltip com informações
  if (compact || sentAt || expiresAt) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
              {sentAt && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Enviado em:</span>{' '}
                  {formatDate(sentAt)}
                </p>
              )}
              {expiresAt && status === 'pending' && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Expira:</span>{' '}
                  {getTimeRemaining(expiresAt)}
                </p>
              )}
              {expiresAt && status === 'expired' && (
                <p className="text-xs text-orange-600">
                  Expirou em {formatDate(expiresAt)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}

