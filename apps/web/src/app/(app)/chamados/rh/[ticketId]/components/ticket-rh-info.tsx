import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RH_TYPE_LABELS } from '../../constants'
import { Badge } from '@/components/ui/badge'
import { Users, Info, AlertTriangle, Package, PackageMinus } from 'lucide-react'

interface TicketRHInfoProps {
  ticket: any
}

function getStockStatus(uniform: any, requestedQuantity: number) {
  if (!uniform) return null
  
  const currentStock = uniform.current_stock || 0
  const minStock = uniform.min_stock || 0
  
  if (currentStock < requestedQuantity) {
    return {
      status: 'insufficient',
      label: 'Estoque Insuficiente',
      description: `Disponível: ${currentStock} / Solicitado: ${requestedQuantity}`,
      variant: 'destructive' as const,
      icon: PackageMinus,
      bgClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-900',
      descClass: 'text-red-700'
    }
  }
  
  if (currentStock <= minStock) {
    return {
      status: 'low',
      label: 'Estoque Baixo',
      description: `Disponível: ${currentStock} (mínimo: ${minStock})`,
      variant: 'outline' as const,
      icon: AlertTriangle,
      bgClass: 'bg-yellow-50 border-yellow-200',
      textClass: 'text-yellow-900',
      descClass: 'text-yellow-700'
    }
  }
  
  return {
    status: 'ok',
    label: 'Estoque OK',
    description: `Disponível: ${currentStock}`,
    variant: 'secondary' as const,
    icon: Package,
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-900',
    descClass: 'text-green-700'
  }
}

export function TicketRHInfo({ ticket }: TicketRHInfoProps) {
  const { rh_details, uniform } = ticket
  const requestedQuantity = rh_details?.specific_fields?.quantity || 1
  const stockStatus = rh_details?.rh_type === 'uniform' ? getStockStatus(uniform, requestedQuantity) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Detalhes de RH
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Tipo de Solicitação</Label>
            <div className="font-medium">
              {RH_TYPE_LABELS[rh_details?.rh_type] || rh_details?.rh_type}
            </div>
          </div>
          
          {rh_details?.rh_type === 'uniform' && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Motivo da Retirada</Label>
              <div className="font-medium">
                <Badge variant="outline">{rh_details.withdrawal_reason}</Badge>
              </div>
            </div>
          )}
        </div>

        {rh_details?.rh_type === 'uniform' && uniform && (
          <div className="space-y-3">
            {/* Uniforme Info */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="grid gap-1 flex-1">
                  <div className="font-semibold text-blue-900">Uniforme Solicitado</div>
                  <div className="text-sm text-blue-800">
                    {uniform.name} {uniform.size ? `(Tam: ${uniform.size})` : ''}
                  </div>
                  <div className="text-sm text-blue-700">
                    Quantidade: {requestedQuantity}
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Status Alert */}
            {stockStatus && (
              <div className={`rounded-lg border p-4 ${stockStatus.bgClass}`}>
                <div className="flex items-start gap-3">
                  <stockStatus.icon className={`h-5 w-5 mt-0.5 ${
                    stockStatus.status === 'insufficient' ? 'text-red-600' :
                    stockStatus.status === 'low' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div className="grid gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${stockStatus.textClass}`}>
                        {stockStatus.label}
                      </span>
                      <Badge variant={stockStatus.variant}>
                        {uniform.current_stock} un.
                      </Badge>
                    </div>
                    <div className={`text-sm ${stockStatus.descClass}`}>
                      {stockStatus.description}
                    </div>
                    {stockStatus.status === 'insufficient' && (
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Não é possível entregar este uniforme sem reposição do estoque
                      </div>
                    )}
                    {stockStatus.status === 'low' && (
                      <div className="text-xs text-yellow-600 mt-1">
                        💡 Considere solicitar reposição de estoque
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-muted-foreground">Descrição / Justificativa</Label>
          <div className="text-sm bg-muted/30 p-3 rounded-md border whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

