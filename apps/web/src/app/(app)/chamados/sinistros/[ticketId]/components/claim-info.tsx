'use client'

import { Calendar, MapPin, FileText, AlertCircle, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OCCURRENCE_TYPES } from '../../constants'

interface ClaimInfoProps {
  ticket: {
    description: string
    denial_reason: string | null
    status: string
    claim_details: Array<{
      occurrence_type: string | null
      occurrence_date: string | null
      occurrence_time: string | null
      location_description: string | null
      police_report_number: string | null
      police_report_date: string | null
    }> | null
  }
}

export function ClaimInfo({ ticket }: ClaimInfoProps) {
  const claimDetails = ticket.claim_details?.[0]
  const occurrenceType = claimDetails?.occurrence_type
  const occurrenceLabel = OCCURRENCE_TYPES.find(t => t.value === occurrenceType)?.label || occurrenceType
  
  return (
    <div className="space-y-4">
      {/* Detalhes da Ocorrência */}
      {claimDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Informações da Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {occurrenceType && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Tipo de Ocorrência
                  </p>
                  <p className="font-medium">{occurrenceLabel}</p>
                </div>
              )}
              
              {claimDetails.occurrence_date && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Data da Ocorrência
                  </p>
                  <p className="font-medium">
                    {format(new Date(claimDetails.occurrence_date), "dd/MM/yyyy", { locale: ptBR })}
                    {claimDetails.occurrence_time && ` às ${claimDetails.occurrence_time.slice(0, 5)}`}
                  </p>
                </div>
              )}
              
              {claimDetails.location_description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Local da Ocorrência
                  </p>
                  <p className="font-medium">{claimDetails.location_description}</p>
                </div>
              )}
              
              {claimDetails.police_report_number && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    Boletim de Ocorrência
                  </p>
                  <p className="font-medium">
                    {claimDetails.police_report_number}
                    {claimDetails.police_report_date && (
                      <span className="text-muted-foreground text-sm ml-2">
                        ({format(new Date(claimDetails.police_report_date), "dd/MM/yyyy", { locale: ptBR })})
                      </span>
                    )}
                  </p>
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
            Descrição Detalhada
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

