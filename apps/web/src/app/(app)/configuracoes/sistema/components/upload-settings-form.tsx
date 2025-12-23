'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateUploadSettings } from '../actions'
import { FILE_TYPE_OPTIONS } from '../constants'
import type { SystemSettingsMap } from '../actions'

interface UploadSettingsFormProps {
  settings: SystemSettingsMap
  onUpdate: () => void
}

export function UploadSettingsForm({ settings, onUpdate }: UploadSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [maxSize, setMaxSize] = useState(settings.upload_max_size_mb.toString())
  const [allowedTypes, setAllowedTypes] = useState<string[]>(settings.upload_allowed_types)

  const hasChanges =
    maxSize !== settings.upload_max_size_mb.toString() ||
    JSON.stringify(allowedTypes.sort()) !==
      JSON.stringify([...settings.upload_allowed_types].sort())

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setAllowedTypes([...allowedTypes, type])
    } else {
      setAllowedTypes(allowedTypes.filter((t) => t !== type))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const size = parseInt(maxSize, 10)
    if (isNaN(size) || size < 1 || size > 100) {
      toast.error('Tamanho máximo deve ser entre 1 e 100 MB')
      return
    }

    if (allowedTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de arquivo permitido')
      return
    }

    setIsLoading(true)
    try {
      const result = await updateUploadSettings({
        upload_max_size_mb: size,
        upload_allowed_types: allowedTypes,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Configurações de upload atualizadas com sucesso')
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating upload settings:', error)
      toast.error('Erro ao atualizar configurações de upload')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="max_size">Tamanho Máximo de Upload (MB)</Label>
        <Input
          id="max_size"
          type="number"
          min="1"
          max="100"
          value={maxSize}
          onChange={(e) => setMaxSize(e.target.value)}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Tamanho máximo permitido para cada arquivo (1-100 MB)
        </p>
      </div>

      <div className="space-y-3">
        <Label>Tipos de Arquivo Permitidos</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FILE_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={allowedTypes.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleTypeToggle(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={option.value}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </form>
  )
}

