'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  AlertTriangle,
  MessageSquare,
  FileUp,
  Settings,
  Phone,
  Mail,
  MessageCircle,
  Users,
  ShoppingCart,
  DollarSign,
  FileSearch,
  Wrench,
  Package
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { statusLabels } from '../../constants'

interface HistoryItem {
  id: string
  action: string
  old_value: string | null
  new_value: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface Communication {
  id: string
  communication_date: string
  channel: string
  summary: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface Purchase {
  id: string
  title: string
  status: string
  created_at: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ClaimTimelineProps {
  history: HistoryItem[]
  communications?: Communication[]
  purchases?: Purchase[]
}

type TimelineItem = {
  id: string
  type: 'history' | 'communication' | 'purchase'
  date: string
  data: HistoryItem | Communication | Purchase
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  // Ações de ticket
  'created': { icon: CheckCircle2, color: 'text-green-500', label: 'Sinistro criado' },
  'status_changed': { icon: Settings, color: 'text-blue-500', label: 'Status alterado' },
  'assigned': { icon: UserPlus, color: 'text-purple-500', label: 'Responsável atribuído' },
  'priority_changed': { icon: AlertTriangle, color: 'text-orange-500', label: 'Prioridade alterada' },
  'commented': { icon: MessageSquare, color: 'text-cyan-500', label: 'Comentário adicionado' },
  'attachment_added': { icon: FileUp, color: 'text-emerald-500', label: 'Anexo adicionado' },
  'approval_approved': { icon: CheckCircle2, color: 'text-green-500', label: 'Aprovado' },
  'approval_rejected': { icon: XCircle, color: 'text-red-500', label: 'Rejeitado' },
  'triaged': { icon: FileSearch, color: 'text-primary', label: 'Sinistro triado' },
  // Comunicações
  'communication_telefone': { icon: Phone, color: 'text-blue-500', label: 'Contato por telefone' },
  'communication_whatsapp': { icon: MessageCircle, color: 'text-green-500', label: 'Contato por WhatsApp' },
  'communication_email': { icon: Mail, color: 'text-purple-500', label: 'Contato por e-mail' },
  'communication_presencial': { icon: Users, color: 'text-orange-500', label: 'Contato presencial' },
  'communication_outro': { icon: MessageSquare, color: 'text-gray-500', label: 'Comunicação registrada' },
  // Compras
  'purchase_created': { icon: ShoppingCart, color: 'text-indigo-500', label: 'Compra criada' },
  'purchase_approved': { icon: DollarSign, color: 'text-green-500', label: 'Compra aprovada' },
  'purchase_completed': { icon: Package, color: 'text-emerald-500', label: 'Compra concluída' },
  // Outros
  'in_repair': { icon: Wrench, color: 'text-blue-600', label: 'Em reparo' },
}

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
}

export function ClaimTimeline({ history, communications = [], purchases = [] }: ClaimTimelineProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Combinar todos os eventos em uma única timeline
  const timelineItems: TimelineItem[] = [
    // Histórico do ticket
    ...history.map(item => ({
      id: item.id,
      type: 'history' as const,
      date: item.created_at,
      data: item
    })),
    // Comunicações
    ...communications.map(comm => ({
      id: `comm-${comm.id}`,
      type: 'communication' as const,
      date: comm.communication_date,
      data: comm
    })),
    // Compras
    ...purchases.map(purchase => ({
      id: `purchase-${purchase.id}`,
      type: 'purchase' as const,
      date: purchase.created_at,
      data: purchase
    }))
  ]

  // Ordenar por data (mais recente primeiro)
  const sortedItems = timelineItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const getActionDescription = (item: HistoryItem) => {
    const config = actionConfig[item.action] || { 
      icon: Clock, 
      color: 'text-muted-foreground', 
      label: item.action 
    }
    
    let description = config.label
    
    if (item.action === 'status_changed' && item.old_value && item.new_value) {
      description = `Status alterado de "${statusLabels[item.old_value] || item.old_value}" para "${statusLabels[item.new_value] || item.new_value}"`
    }
    
    if (item.action === 'priority_changed' && item.new_value) {
      description = `Prioridade definida como "${priorityLabels[item.new_value] || item.new_value}"`
    }
    
    if (item.action === 'triaged' && item.metadata) {
      const metadata = item.metadata as { priority?: string; due_date?: string }
      const priority = metadata.priority ? priorityLabels[metadata.priority] || metadata.priority : null
      description = `Sinistro triado${priority ? ` com prioridade ${priority}` : ''}`
    }
    
    return { ...config, description }
  }

  const getCommunicationConfig = (channel: string) => {
    const key = `communication_${channel}`
    return actionConfig[key] || actionConfig['communication_outro']
  }

  const renderTimelineItem = (item: TimelineItem) => {
    if (item.type === 'history') {
      const historyItem = item.data as HistoryItem
      const { icon: Icon, color, description } = getActionDescription(historyItem)
      
      return (
        <div key={item.id} className="relative flex gap-4 pl-10">
          <div className={`absolute left-0 p-1.5 bg-background border rounded-full ${color}`}>
            <Icon className="h-3 w-3" />
          </div>
          
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={historyItem.user?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(historyItem.user?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {historyItem.user?.full_name || 'Sistema'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(historyItem.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
      )
    }
    
    if (item.type === 'communication') {
      const comm = item.data as Communication
      const { icon: Icon, color, label } = getCommunicationConfig(comm.channel)
      
      return (
        <div key={item.id} className="relative flex gap-4 pl-10">
          <div className={`absolute left-0 p-1.5 bg-background border rounded-full ${color}`}>
            <Icon className="h-3 w-3" />
          </div>
          
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={comm.creator?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(comm.creator?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {comm.creator?.full_name || 'Desconhecido'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comm.communication_date), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {label}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
              {comm.summary}
            </p>
          </div>
        </div>
      )
    }
    
    if (item.type === 'purchase') {
      const purchase = item.data as Purchase
      const config = actionConfig['purchase_created']
      const Icon = config.icon
      
      return (
        <div key={item.id} className="relative flex gap-4 pl-10">
          <div className={`absolute left-0 p-1.5 bg-background border rounded-full ${config.color}`}>
            <Icon className="h-3 w-3" />
          </div>
          
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={purchase.creator?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(purchase.creator?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {purchase.creator?.full_name || 'Desconhecido'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(purchase.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compra interna criada
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {purchase.title}
            </p>
          </div>
        </div>
      )
    }
    
    return null
  }
  
  if (sortedItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum histórico disponível
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-4">
            {sortedItems.map(renderTimelineItem)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

