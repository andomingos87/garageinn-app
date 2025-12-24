'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft, Building2, Mail, Bell, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  SettingsSection,
  GeneralSettingsForm,
  EmailSettingsForm,
  NotificationSettingsForm,
  UploadSettingsForm,
} from './components'
import { getSystemSettings, checkIsAdmin } from './actions'
import type { SystemSettingsMap } from './actions'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SistemaPage() {
  const [settings, setSettings] = useState<SystemSettingsMap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [, startTransition] = useTransition()

  const loadData = async () => {
    try {
      const [settingsData, admin] = await Promise.all([
        getSystemSettings(),
        checkIsAdmin(),
      ])
      setSettings(settingsData)
      setIsAdmin(admin)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdate = () => {
    startTransition(() => {
      loadData()
    })
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Configurações do Sistema
          </h2>
          <p className="text-muted-foreground">
            Gerencie as configurações gerais da aplicação
          </p>
        </div>
      </div>

      <Separator />

      {/* Content */}
      {isLoading || !settings ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6">
          {/* General Settings */}
          <SettingsSection
            title="Configurações Gerais"
            description="Nome da empresa e configurações básicas"
            icon={Building2}
          >
            <GeneralSettingsForm settings={settings} onUpdate={handleUpdate} />
          </SettingsSection>

          {/* Email Settings */}
          <SettingsSection
            title="Configurações de Email"
            description="Servidor SMTP para envio de notificações"
            icon={Mail}
          >
            <EmailSettingsForm settings={settings} onUpdate={handleUpdate} />
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection
            title="Notificações"
            description="Configurações de notificações do sistema"
            icon={Bell}
          >
            <NotificationSettingsForm settings={settings} onUpdate={handleUpdate} />
          </SettingsSection>

          {/* Upload Settings */}
          <SettingsSection
            title="Upload de Arquivos"
            description="Limites e tipos de arquivo permitidos"
            icon={Upload}
          >
            <UploadSettingsForm settings={settings} onUpdate={handleUpdate} />
          </SettingsSection>
        </div>
      )}
    </div>
  )
}

