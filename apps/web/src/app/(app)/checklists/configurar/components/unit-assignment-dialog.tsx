'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, Search, Building2 } from 'lucide-react'
import { assignTemplateToUnits, getAllUnits, getTemplateUnits } from '../actions'

interface Unit {
  id: string
  name: string
  code: string
  status: string
}

interface UnitAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  onSuccess?: () => void
}

export function UnitAssignmentDialog({
  open,
  onOpenChange,
  templateId,
  onSuccess,
}: UnitAssignmentDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // Carregar unidades quando o dialog abrir
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setError(null)
      Promise.all([getAllUnits(), getTemplateUnits(templateId)])
        .then(([allUnits, assignedUnits]) => {
          setUnits(allUnits)
          setSelectedIds(new Set(assignedUnits.map((u: Unit) => u.id)))
        })
        .catch((err) => {
          console.error('Error loading units:', err)
          setError('Erro ao carregar unidades')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [open, templateId])

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (unitId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(unitId)) {
        next.delete(unitId)
      } else {
        next.add(unitId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUnits.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUnits.map((u) => u.id)))
    }
  }

  const handleSubmit = () => {
    setError(null)

    startTransition(async () => {
      const result = await assignTemplateToUnits(templateId, Array.from(selectedIds))

      if (result.error) {
        setError(result.error)
      } else {
        onOpenChange(false)
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vincular Unidades</DialogTitle>
          <DialogDescription>
            Selecione as unidades que devem usar este template de checklist.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedIds.size} unidade{selectedIds.size !== 1 ? 's' : ''} selecionada
              {selectedIds.size !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              {selectedIds.size === filteredUnits.length ? 'Desmarcar' : 'Selecionar'} todas
            </Button>
          </div>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade ativa'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggle(unit.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(unit.id)}
                      onCheckedChange={() => handleToggle(unit.id)}
                    />
                    <Label className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">{unit.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {unit.code}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isLoading}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

