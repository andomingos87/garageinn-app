'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Users, MoreVertical, Pencil, Eye, Power } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UnitStatusBadge } from './unit-status-badge'
import type { UnitWithStaffCount } from '@/lib/supabase/custom-types'

interface UnitCardProps {
  unit: UnitWithStaffCount
  isAdmin: boolean
  onToggleStatus?: (unitId: string, newStatus: 'active' | 'inactive') => void
}

export function UnitCard({ unit, isAdmin, onToggleStatus }: UnitCardProps) {
  const handleToggleStatus = () => {
    const newStatus = unit.status === 'active' ? 'inactive' : 'active'
    onToggleStatus?.(unit.id, newStatus)
  }

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/unidades/${unit.id}`} className="flex-1 min-w-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{unit.name}</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {unit.code}
              </CardDescription>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <UnitStatusBadge status={unit.status} />
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/unidades/${unit.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/unidades/${unit.id}/editar`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    <Power className="mr-2 h-4 w-4" />
                    {unit.status === 'active' ? 'Desativar' : 'Ativar'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={`/unidades/${unit.id}`}>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="truncate">{unit.address}</p>
              <p className="text-muted-foreground truncate">
                {[unit.neighborhood, unit.city, unit.state].filter(Boolean).join(', ') || 'Endereço não informado'}
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <div className="flex items-center gap-1">
            {unit.capacity ? (
              <>
                <span className="font-medium">{unit.capacity.toLocaleString('pt-BR')}</span>
                <span className="text-muted-foreground">vagas</span>
              </>
            ) : (
              <span className="text-muted-foreground">Sem capacidade</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{unit.staff_count} funcionário{unit.staff_count !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {unit.region && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-muted rounded-full">
              {unit.region}
            </span>
            {unit.administrator && (
              <span className="px-2 py-0.5 bg-muted rounded-full">
                {unit.administrator}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

