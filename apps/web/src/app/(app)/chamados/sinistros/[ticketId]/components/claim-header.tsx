'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, Building2, Tag, AlertTriangle, Car, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClaimStatusBadge, PriorityBadge } from '../../components/claim-status-badge'
import { OCCURRENCE_TYPES } from '../../constants'

interface ClaimHeaderProps {
  ticket: {
    id: string
    ticket_number: number
    title: string
    status: string
    priority: string | null
    created_at: string
    category: { id: string; name: string } | null
    unit: { id: string; name: string; code: string } | null
    creator: { id: string; full_name: string; avatar_url: string | null; email: string } | null
    assignee: { id: string; full_name: string; avatar_url: string | null; email: string } | null
    claim_details: Array<{
      occurrence_type: string | null
      occurrence_date: string | null
      location_description: string | null
      vehicle_plate: string | null
    }> | null
  }
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Baixa', variant: 'secondary' },
  medium: { label: 'Média', variant: 'default' },
  high: { label: 'Alta', variant: 'destructive' },
  urgent: { label: 'Urgente', variant: 'destructive' },
}

export function ClaimHeader({ ticket }: ClaimHeaderProps) {
  const router = useRouter()
  
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
  const claimDetails = ticket.claim_details?.[0]
  const occurrenceType = claimDetails?.occurrence_type
  const occurrenceLabel = OCCURRENCE_TYPES.find(t => t.value === occurrenceType)?.label || occurrenceType
  
  return (
    <div className="space-y-4">
      {/* Voltar e Número */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/chamados/sinistros')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <span className="text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Sinistro #{ticket.ticket_number}
        </span>
      </div>
      
      {/* Título e Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <ClaimStatusBadge status={ticket.status} />
            
            <PriorityBadge priority={ticket.priority} />
            
            {occurrenceType && (
              <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
                <AlertTriangle className="h-3 w-3" />
                {occurrenceLabel}
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
            <AvatarImage src={ticket.creator?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(ticket.creator?.full_name || null)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Solicitante</p>
            <p className="text-sm font-medium truncate">{ticket.creator?.full_name || 'Desconhecido'}</p>
          </div>
        </div>
        
        {/* Responsável */}
        <div className="flex items-center gap-2">
          {ticket.assignee ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={ticket.assignee.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(ticket.assignee.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="text-sm font-medium truncate">{ticket.assignee.full_name}</p>
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
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="text-sm font-medium truncate">{ticket.category?.name || 'Não definida'}</p>
          </div>
        </div>
        
        {/* Unidade */}
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 p-1.5 bg-muted rounded-full text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Unidade</p>
            <p className="text-sm font-medium truncate">
              {ticket.unit ? `${ticket.unit.name} (${ticket.unit.code})` : 'Não definida'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Informações adicionais do sinistro */}
      {claimDetails && (claimDetails.vehicle_plate || claimDetails.location_description || claimDetails.occurrence_date) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {claimDetails.vehicle_plate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>Placa: <span className="font-medium text-foreground">{claimDetails.vehicle_plate}</span></span>
            </div>
          )}
          {claimDetails.location_description && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Local: {claimDetails.location_description}</span>
            </div>
          )}
          {claimDetails.occurrence_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ocorrência: {format(new Date(claimDetails.occurrence_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
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

