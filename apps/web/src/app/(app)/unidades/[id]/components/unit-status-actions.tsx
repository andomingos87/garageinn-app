'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Power, Loader2 } from 'lucide-react'
import { updateUnitStatus } from '../../actions'
import type { UnitStatus } from '@/lib/supabase/database.types'

interface UnitStatusActionsProps {
  unitId: string
  currentStatus: UnitStatus
}

export function UnitStatusActions({ unitId, currentStatus }: UnitStatusActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const isActive = currentStatus === 'active'
  const newStatus: UnitStatus = isActive ? 'inactive' : 'active'

  const handleToggleStatus = () => {
    startTransition(async () => {
      await updateUnitStatus(unitId, newStatus)
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Power className="mr-2 h-4 w-4" />
          )}
          {isActive ? 'Desativar' : 'Ativar'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Desativar Unidade?' : 'Ativar Unidade?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? 'Ao desativar esta unidade, ela não aparecerá mais nas listagens para usuários comuns. Os vínculos de funcionários serão mantidos.'
              : 'Ao ativar esta unidade, ela voltará a aparecer nas listagens e poderá receber novos vínculos.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleStatus} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActive ? 'Desativar' : 'Ativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

