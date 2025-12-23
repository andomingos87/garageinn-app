'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateNotificationSettings } from '../actions'
import type { SystemSettingsMap } from '../actions'

interface NotificationSettingsFormProps {
  settings: SystemSettingsMap
  onUpdate: () => void
}

export function NotificationSettingsForm({
  settings,
  onUpdate,
}: NotificationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(settings.notifications_email_enabled)
  const [pushEnabled, setPushEnabled] = useState(settings.notifications_push_enabled)

  const hasChanges =
    emailEnabled !== settings.notifications_email_enabled ||
    pushEnabled !== settings.notifications_push_enabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const result = await updateNotificationSettings({
        notifications_email_enabled: emailEnabled,
        notifications_push_enabled: pushEnabled,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Configurações de notificação atualizadas com sucesso')
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error('Erro ao atualizar configurações de notificação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="email_notifications" className="text-base">
              Notificações por Email
            </Label>
            <p className="text-sm text-muted-foreground">
              Enviar notificações por email para eventos importantes
            </p>
          </div>
          <Switch
            id="email_notifications"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="push_notifications" className="text-base">
              Notificações Push
            </Label>
            <p className="text-sm text-muted-foreground">
              Enviar notificações push para o navegador (em desenvolvimento)
            </p>
          </div>
          <Switch
            id="push_notifications"
            checked={pushEnabled}
            onCheckedChange={setPushEnabled}
            disabled
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

