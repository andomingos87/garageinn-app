'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSearch,
  Wrench,
  Star,
  Ban,
  UserCheck,
  PackageSearch,
  Settings,
  PackageX,
} from 'lucide-react'

// Status labels em português (específicos de Manutenção)
export const STATUS_LABELS: Record<string, string> = {
  // Fase de aprovação
  awaiting_approval_encarregado: 'Aguardando Aprovação (Encarregado)',
  awaiting_approval_supervisor: 'Aguardando Aprovação (Supervisor)',
  awaiting_approval_gerente: 'Aguardando Aprovação (Gerente)',
  // Fase de triagem e execução
  awaiting_triage: 'Aguardando Triagem',
  in_progress: 'Em Andamento',
  technical_analysis: 'Em Análise Técnica',
  awaiting_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  executing: 'Executando Manutenção',
  waiting_parts: 'Aguardando Peças/Materiais',
  completed: 'Concluído',
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

// Maintenance type labels
export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  emergencial: 'Emergencial',
}

// Status icons and colors (específicos de Manutenção)
const STATUS_CONFIG: Record<string, { icon: typeof Clock; className: string }> = {
  // Aguardando aprovação
  awaiting_approval_encarregado: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  awaiting_approval_supervisor: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  awaiting_approval_gerente: { icon: UserCheck, className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  // Triagem
  awaiting_triage: { icon: FileSearch, className: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800' },
  in_progress: { icon: Clock, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  // Análise e aprovação
  technical_analysis: { icon: PackageSearch, className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
  awaiting_approval: { icon: AlertCircle, className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  approved: { icon: CheckCircle2, className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  // Execução
  executing: { icon: Settings, className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  waiting_parts: { icon: PackageX, className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  // Conclusão
  completed: { icon: Wrench, className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  evaluating: { icon: Star, className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
  // Finais
  closed: { icon: CheckCircle2, className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  denied: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
  cancelled: { icon: Ban, className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
}

// Priority colors
const PRIORITY_CONFIG: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  medium: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  urgent: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
}

// Maintenance type colors
const MAINTENANCE_TYPE_CONFIG: Record<string, string> = {
  preventiva: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
  corretiva: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  emergencial: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
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

interface MaintenanceTypeBadgeProps {
  type: string | null
  size?: 'sm' | 'md'
}

export function MaintenanceTypeBadge({ type, size = 'md' }: MaintenanceTypeBadgeProps) {
  if (!type) return null

  const className = MAINTENANCE_TYPE_CONFIG[type] || MAINTENANCE_TYPE_CONFIG.corretiva
  const label = MAINTENANCE_TYPE_LABELS[type] || type

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

