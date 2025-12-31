'use client'

import { Users, Phone, Car, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ClaimThirdPartyProps {
  claimDetails: {
    has_third_party: boolean | null
    third_party_name: string | null
    third_party_phone: string | null
    third_party_plate: string | null
    third_party_info: Record<string, unknown> | null
  } | null
}

export function ClaimThirdParty({ claimDetails }: ClaimThirdPartyProps) {
  if (!claimDetails) return null
  
  const { has_third_party, third_party_name, third_party_phone, third_party_plate, third_party_info } = claimDetails
  
  // Se não houve terceiro envolvido, não renderiza
  if (!has_third_party) {
    return null
  }
  
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-600" />
          Terceiro Envolvido
          <Badge variant="outline" className="ml-auto text-amber-600 border-amber-300 bg-amber-100 dark:bg-amber-900/30">
            Sim
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {third_party_name && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Nome
              </p>
              <p className="font-medium">{third_party_name}</p>
            </div>
          )}
          
          {third_party_phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </p>
              <p className="font-medium">
                <a 
                  href={`tel:${third_party_phone.replace(/\D/g, '')}`}
                  className="hover:underline text-primary"
                >
                  {third_party_phone}
                </a>
              </p>
            </div>
          )}
          
          {third_party_plate && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Car className="h-3 w-3" />
                Placa do Veículo
              </p>
              <p className="font-medium tracking-wider">{third_party_plate}</p>
            </div>
          )}
        </div>
        
        {/* Informações adicionais em JSON */}
        {third_party_info && Object.keys(third_party_info).length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Informações Adicionais
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(third_party_info).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

