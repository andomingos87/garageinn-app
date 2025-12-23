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
  Settings
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

interface TicketTimelineProps {
  history: HistoryItem[]
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  'created': { icon: CheckCircle2, color: 'text-green-500', label: 'Chamado criado' },
  'status_changed': { icon: Settings, color: 'text-blue-500', label: 'Status alterado' },
  'assigned': { icon: UserPlus, color: 'text-purple-500', label: 'Responsável atribuído' },
  'priority_changed': { icon: AlertTriangle, color: 'text-orange-500', label: 'Prioridade alterada' },
  'commented': { icon: MessageSquare, color: 'text-cyan-500', label: 'Comentário adicionado' },
  'attachment_added': { icon: FileUp, color: 'text-emerald-500', label: 'Anexo adicionado' },
  'approval_approved': { icon: CheckCircle2, color: 'text-green-500', label: 'Aprovado' },
  'approval_rejected': { icon: XCircle, color: 'text-red-500', label: 'Rejeitado' },
}

export function TicketTimeline({ history }: TicketTimelineProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
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
      const priorityLabels: Record<string, string> = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        urgent: 'Urgente'
      }
      description = `Prioridade definida como "${priorityLabels[item.new_value] || item.new_value}"`
    }
    
    return { ...config, description }
  }
  
  if (!history || history.length === 0) {
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
            {history.map((item, index) => {
              const { icon: Icon, color, description } = getActionDescription(item)
              
              return (
                <div key={item.id} className="relative flex gap-4 pl-10">
                  {/* Ícone */}
                  <div className={`absolute left-0 p-1.5 bg-background border rounded-full ${color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={item.user?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(item.user?.full_name || null)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {item.user?.full_name || 'Sistema'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.created_at), { 
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
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

