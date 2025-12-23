'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateGeneralSettings } from '../actions'
import { TIMEZONE_OPTIONS } from '../constants'
import type { SystemSettingsMap } from '../actions'

interface GeneralSettingsFormProps {
  settings: SystemSettingsMap
  onUpdate: () => void
}

export function GeneralSettingsForm({ settings, onUpdate }: GeneralSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState(settings.company_name)
  const [timezone, setTimezone] = useState(settings.timezone)

  const hasChanges =
    companyName !== settings.company_name || timezone !== settings.timezone

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      toast.error('Nome da empresa é obrigatório')
      return
    }

    setIsLoading(true)
    try {
      const result = await updateGeneralSettings({
        company_name: companyName.trim(),
        timezone,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Configurações atualizadas com sucesso')
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Erro ao atualizar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nome da Empresa</Label>
          <Input
            id="company_name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone Padrão</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Selecione o timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

