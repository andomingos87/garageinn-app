'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, Building2, Tag, AlertTriangle, Wrench, MapPin, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '../../components/status-badge'
import { MAINTENANCE_TYPES } from '../../constants'

interface TicketHeaderProps {
  ticket: {
    id: string
    ticket_number: number
    title: string
    status: string
    priority: string | null
    perceived_urgency: string | null
    created_at: string
    category_name: string | null
    unit_name: string | null
    unit_code: string | null
    created_by_name: string | null
    created_by_avatar: string | null
    assigned_to_name: string | null
    assigned_to_avatar: string | null
    maintenance_type: string | null
    location_description: string | null
    equipment_affected: string | null
  }
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Baixa', variant: 'secondary' },
  medium: { label: 'Média', variant: 'default' },
  high: { label: 'Alta', variant: 'destructive' },
  urgent: { label: 'Urgente', variant: 'destructive' },
}

const urgencyConfig: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export function TicketHeader({ ticket }: TicketHeaderProps) {
  const router = useRouter()
  
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
  return (
    <div className="space-y-4">
      {/* Voltar e Número */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/chamados/manutencao')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <span className="text-muted-foreground flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Chamado #{ticket.ticket_number}
        </span>
      </div>
      
      {/* Título e Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            
            {ticket.priority && (
              <Badge variant={priorityConfig[ticket.priority]?.variant || 'secondary'}>
                {priorityConfig[ticket.priority]?.label || ticket.priority}
              </Badge>
            )}
            
            {ticket.perceived_urgency && !ticket.priority && (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgência: {urgencyConfig[ticket.perceived_urgency] || ticket.perceived_urgency}
              </Badge>
            )}
            
            {ticket.maintenance_type && (
              <Badge variant="outline" className="gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800">
                <Settings2 className="h-3 w-3" />
                {MAINTENANCE_TYPES[ticket.maintenance_type as keyof typeof MAINTENANCE_TYPES] || ticket.maintenance_type}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Metadados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        {/* Solicitante */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={ticket.created_by_avatar || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(ticket.created_by_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Solicitante</p>
            <p className="text-sm font-medium truncate">{ticket.created_by_name || 'Desconhecido'}</p>
          </div>
        </div>
        
        {/* Responsável */}
        <div className="flex items-center gap-2">
          {ticket.assigned_to_name ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={ticket.assigned_to_avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(ticket.assigned_to_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="text-sm font-medium truncate">{ticket.assigned_to_name}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-8 w-8 p-1.5 bg-muted rounded-full" />
              <div>
                <p className="text-xs">Responsável</p>
                <p className="text-sm">Não atribuído</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Categoria */}
        <div className="flex items-center gap-2">
          <Tag className="h-8 w-8 p-1.5 bg-muted rounded-full text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Assunto</p>
            <p className="text-sm font-medium truncate">{ticket.category_name || 'Não definido'}</p>
          </div>
        </div>
        
        {/* Unidade */}
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 p-1.5 bg-muted rounded-full text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Unidade</p>
            <p className="text-sm font-medium truncate">
              {ticket.unit_name ? `${ticket.unit_name} (${ticket.unit_code})` : 'Não definida'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Informações adicionais de manutenção */}
      {(ticket.location_description || ticket.equipment_affected) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {ticket.location_description && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Local: {ticket.location_description}</span>
            </div>
          )}
          {ticket.equipment_affected && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wrench className="h-4 w-4" />
              <span>Equipamento: {ticket.equipment_affected}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Data de Criação */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          Criado {formatDistanceToNow(new Date(ticket.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </span>
      </div>
    </div>
  )
}

