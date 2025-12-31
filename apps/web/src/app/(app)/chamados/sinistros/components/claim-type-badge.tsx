'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Car,
  Building2,
  Wrench,
  Users,
  AlertTriangle,
} from 'lucide-react'

// Categorias de sinistro
export const CLAIM_CATEGORIES: Record<string, { label: string; icon: typeof Car; className: string }> = {
  'Veículo de Cliente': {
    label: 'Veículo de Cliente',
    icon: Car,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'Veículo de Terceiro': {
    label: 'Veículo de Terceiro',
    icon: Car,
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  'Estrutura da Unidade': {
    label: 'Estrutura da Unidade',
    icon: Building2,
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'Equipamento': {
    label: 'Equipamento',
    icon: Wrench,
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  'Pessoa/Acidente': {
    label: 'Pessoa/Acidente',
    icon: Users,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

// Tipos de ocorrência
export const OCCURRENCE_TYPES: Record<string, { label: string; className: string }> = {
  colisao: { label: 'Colisão', className: 'bg-red-100 text-red-800 border-red-200' },
  risco: { label: 'Risco/Arranhão', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  furto: { label: 'Furto/Roubo', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  vandalismo: { label: 'Vandalismo', className: 'bg-pink-100 text-pink-800 border-pink-200' },
  queda_objeto: { label: 'Queda de Objeto', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  alagamento: { label: 'Alagamento', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  incendio: { label: 'Incêndio', className: 'bg-red-100 text-red-800 border-red-200' },
  queda_pessoa: { label: 'Queda de Pessoa', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  acidente_trabalho: { label: 'Acidente de Trabalho', className: 'bg-rose-100 text-rose-800 border-rose-200' },
  outro: { label: 'Outro', className: 'bg-gray-100 text-gray-800 border-gray-200' },
}

interface ClaimTypeBadgeProps {
  category: string | null
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export function ClaimTypeBadge({ category, showIcon = true, size = 'md' }: ClaimTypeBadgeProps) {
  if (!category) return null

  const config = CLAIM_CATEGORIES[category] || {
    label: category,
    icon: AlertTriangle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const Icon = config.icon

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
      {config.label}
    </Badge>
  )
}

interface OccurrenceTypeBadgeProps {
  type: string | null
  size?: 'sm' | 'md'
}

export function OccurrenceTypeBadge({ type, size = 'md' }: OccurrenceTypeBadgeProps) {
  if (!type) return null

  const config = OCCURRENCE_TYPES[type] || {
    label: type,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      {config.label}
    </Badge>
  )
}

