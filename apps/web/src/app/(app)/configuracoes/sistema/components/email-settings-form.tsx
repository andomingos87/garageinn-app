'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { updateEmailSettings } from '../actions'
import type { SystemSettingsMap } from '../actions'

interface EmailSettingsFormProps {
  settings: SystemSettingsMap
  onUpdate: () => void
}

export function EmailSettingsForm({ settings, onUpdate }: EmailSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [smtpHost, setSmtpHost] = useState(settings.email_smtp_host || '')
  const [smtpPort, setSmtpPort] = useState(settings.email_smtp_port.toString())
  const [smtpUser, setSmtpUser] = useState(settings.email_smtp_user || '')
  const [smtpFrom, setSmtpFrom] = useState(settings.email_smtp_from || '')
  const [smtpFromName, setSmtpFromName] = useState(settings.email_smtp_from_name)

  const hasChanges =
    smtpHost !== (settings.email_smtp_host || '') ||
    smtpPort !== settings.email_smtp_port.toString() ||
    smtpUser !== (settings.email_smtp_user || '') ||
    smtpFrom !== (settings.email_smtp_from || '') ||
    smtpFromName !== settings.email_smtp_from_name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const port = parseInt(smtpPort, 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      toast.error('Porta SMTP inválida')
      return
    }

    setIsLoading(true)
    try {
      const result = await updateEmailSettings({
        email_smtp_host: smtpHost.trim() || null,
        email_smtp_port: port,
        email_smtp_user: smtpUser.trim() || null,
        email_smtp_from: smtpFrom.trim() || null,
        email_smtp_from_name: smtpFromName.trim(),
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Configurações de email atualizadas com sucesso')
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating email settings:', error)
      toast.error('Erro ao atualizar configurações de email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="smtp_host">Servidor SMTP</Label>
          <Input
            id="smtp_host"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_port">Porta</Label>
          <Input
            id="smtp_port"
            type="number"
            min="1"
            max="65535"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            placeholder="587"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_user">Usuário SMTP</Label>
          <div className="relative">
            <Input
              id="smtp_user"
              type={showPassword ? 'text' : 'password'}
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="usuario@exemplo.com"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_from">Email de Origem</Label>
          <Input
            id="smtp_from"
            type="email"
            value={smtpFrom}
            onChange={(e) => setSmtpFrom(e.target.value)}
            placeholder="noreply@exemplo.com"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="smtp_from_name">Nome do Remetente</Label>
          <Input
            id="smtp_from_name"
            value={smtpFromName}
            onChange={(e) => setSmtpFromName(e.target.value)}
            placeholder="GAPP Sistema"
          />
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

