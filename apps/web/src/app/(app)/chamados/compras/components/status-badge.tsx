'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSearch,
  ShoppingCart,
  Truck,
  Package,
  Star,
  Ban,
  UserCheck,
} from 'lucide-react'

// Status labels em português
export const STATUS_LABELS: Record<string, string> = {
  // Fase de aprovação
  awaiting_approval_encarregado: 'Aguardando Aprovação (Encarregado)',
  awaiting_approval_supervisor: 'Aguardando Aprovação (Supervisor)',
  awaiting_approval_gerente: 'Aguardando Aprovação (Gerente)',
  // Fase de triagem e execução
  awaiting_triage: 'Aguardando Triagem',
  in_progress: 'Em Andamento',
  quoting: 'Em Cotação',
  awaiting_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  purchasing: 'Executando Compra',
  in_delivery: 'Em Entrega',
  delivered: 'Entrega Realizada',
  evaluating: 'Em Avaliação',
  closed: 'Fechado',
  denied: 'Negado',
  cancelled: 'Cancelado',
}

// Priority labels
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

// Urgency labels
export const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

// Status icons and colors
const STATUS_CONFIG: Record<string, { icon: typeof Clock; className: string }> = {
  // Aguardando aprovação
  awaiting_approval_encarregado: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  awaiting_approval_supervisor: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  awaiting_approval_gerente: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200' },
  // Triagem
  awaiting_triage: { icon: FileSearch, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { icon: Clock, className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  // Cotação
  quoting: { icon: FileSearch, className: 'bg-purple-100 text-purple-800 border-purple-200' },
  awaiting_approval: { icon: AlertCircle, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  approved: { icon: CheckCircle2, className: 'bg-green-100 text-green-800 border-green-200' },
  // Compra e entrega
  purchasing: { icon: ShoppingCart, className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  in_delivery: { icon: Truck, className: 'bg-sky-100 text-sky-800 border-sky-200' },
  delivered: { icon: Package, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  evaluating: { icon: Star, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  // Finais
  closed: { icon: CheckCircle2, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  denied: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { icon: Ban, className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

// Priority colors
const PRIORITY_CONFIG: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
}

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.awaiting_triage
  const Icon = config.icon
  const label = STATUS_LABELS[status] || status

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {label}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: string | null
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  if (!priority) return null

  const className = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low
  const label = PRIORITY_LABELS[priority] || priority

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      {label}
    </Badge>
  )
}

interface UrgencyBadgeProps {
  urgency: string | null
  size?: 'sm' | 'md'
}

export function UrgencyBadge({ urgency, size = 'md' }: UrgencyBadgeProps) {
  if (!urgency) return null

  const className = PRIORITY_CONFIG[urgency] || PRIORITY_CONFIG.low
  const label = URGENCY_LABELS[urgency] || urgency

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      {label}
    </Badge>
  )
}

