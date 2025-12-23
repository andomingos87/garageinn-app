'use client'

import { Wrench, MapPin, FileText, Settings2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MAINTENANCE_TYPES } from '../../constants'

interface TicketInfoProps {
  ticket: {
    description: string
    maintenance_type: string | null
    location_description: string | null
    equipment_affected: string | null
    denial_reason: string | null
    status: string
  }
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  return (
    <div className="space-y-4">
      {/* Detalhes de Manutenção */}
      {(ticket.maintenance_type || ticket.location_description || ticket.equipment_affected) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Detalhes da Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ticket.maintenance_type && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Settings2 className="h-3 w-3" />
                    Tipo de Manutenção
                  </p>
                  <p className="font-medium">
                    {MAINTENANCE_TYPES[ticket.maintenance_type as keyof typeof MAINTENANCE_TYPES] || ticket.maintenance_type}
                  </p>
                </div>
              )}
              {ticket.location_description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Local
                  </p>
                  <p className="font-medium">{ticket.location_description}</p>
                </div>
              )}
              {ticket.equipment_affected && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Equipamento Afetado
                  </p>
                  <p className="font-medium">{ticket.equipment_affected}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Descrição do Problema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descrição do Problema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>
      
      {/* Motivo da Negação (se negado) */}
      {ticket.status === 'denied' && ticket.denial_reason && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Motivo da Negação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/90 whitespace-pre-wrap">
              {ticket.denial_reason}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

