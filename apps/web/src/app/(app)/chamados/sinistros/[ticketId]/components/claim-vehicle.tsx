'use client'

import { Car, Palette, Calendar as CalendarIcon, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClaimVehicleProps {
  claimDetails: {
    vehicle_plate: string | null
    vehicle_make: string | null
    vehicle_model: string | null
    vehicle_color: string | null
    vehicle_year: number | null
  } | null
}

export function ClaimVehicle({ claimDetails }: ClaimVehicleProps) {
  if (!claimDetails) return null
  
  const { vehicle_plate, vehicle_make, vehicle_model, vehicle_color, vehicle_year } = claimDetails
  
  // Se não tem dados do veículo, não renderiza
  if (!vehicle_plate && !vehicle_make && !vehicle_model && !vehicle_color && !vehicle_year) {
    return null
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Car className="h-4 w-4" />
          Dados do Veículo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vehicle_plate && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Placa
              </p>
              <p className="font-medium text-lg tracking-wider">{vehicle_plate}</p>
            </div>
          )}
          
          {vehicle_make && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Marca</p>
              <p className="font-medium">{vehicle_make}</p>
            </div>
          )}
          
          {vehicle_model && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Modelo</p>
              <p className="font-medium">{vehicle_model}</p>
            </div>
          )}
          
          {vehicle_color && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Cor
              </p>
              <p className="font-medium">{vehicle_color}</p>
            </div>
          )}
          
          {vehicle_year && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Ano
              </p>
              <p className="font-medium">{vehicle_year}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

