'use client'

import { Package, Hash, DollarSign, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TicketInfoProps {
  ticket: {
    description: string
    item_name: string | null
    quantity: number | null
    unit_of_measure: string | null
    estimated_price: number | null
    denial_reason: string | null
    status: string
  }
}

export function TicketInfo({ ticket }: TicketInfoProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  return (
    <div className="space-y-4">
      {/* Detalhes do Item */}
      {ticket.item_name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Detalhes do Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Item</p>
                <p className="font-medium">{ticket.item_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Quantidade
                </p>
                <p className="font-medium">
                  {ticket.quantity} {ticket.unit_of_measure || 'un'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Preço Estimado
                </p>
                <p className="font-medium">{formatCurrency(ticket.estimated_price)}</p>
              </div>
              {ticket.quantity && ticket.estimated_price && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Estimado</p>
                  <p className="font-medium text-primary">
                    {formatCurrency(ticket.quantity * ticket.estimated_price)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Justificativa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Justificativa
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
            <CardTitle className="text-base text-destructive">
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

