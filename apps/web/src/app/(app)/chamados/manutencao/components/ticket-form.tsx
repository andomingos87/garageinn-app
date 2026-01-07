'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft, Wrench, AlertTriangle, MapPin, Settings } from 'lucide-react'
import Link from 'next/link'
import type { MaintenanceCategory, UserUnit } from '../actions'
import { MAINTENANCE_TYPES } from '../constants'

interface MaintenanceTicketFormProps {
  categories: MaintenanceCategory[]
  units: UserUnit[]
  fixedUnit?: UserUnit | null  // Unidade fixa para Manobrista/Encarregado
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

export function MaintenanceTicketForm({ categories, units, fixedUnit, onSubmit }: MaintenanceTicketFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Flags de comportamento baseado no role do usuário
  const isUnitFixed = !!fixedUnit  // Unidade fixa para Manobrista/Encarregado
  const hasUnits = units.length > 0  // Usuário tem unidades disponíveis
  const isUnitRequired = hasUnits  // Obrigatório se tem unidades
  const showUnitWarning = !hasUnits && !isUnitFixed  // Aviso se sem unidades

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    unit_id: fixedUnit?.id || '',  // Auto-preencher se tiver unidade fixa
    maintenance_type: 'corretiva',
    location_description: '',
    equipment_affected: '',
    description: '',
    perceived_urgency: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Título deve ter pelo menos 5 caracteres')
      return
    }
    if (!formData.category_id) {
      setError('Selecione um assunto para a manutenção')
      return
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Descrição deve ter pelo menos 10 caracteres')
      return
    }

    // Validação de unidade (obrigatória se usuário tem unidades disponíveis)
    if (isUnitRequired && !formData.unit_id) {
      setError('Selecione uma unidade para continuar')
      return
    }

    const data = new FormData()
    data.set('title', formData.title)
    data.set('category_id', formData.category_id)
    data.set('unit_id', formData.unit_id)
    data.set('maintenance_type', formData.maintenance_type)
    data.set('location_description', formData.location_description)
    data.set('equipment_affected', formData.equipment_affected)
    data.set('description', formData.description)
    data.set('perceived_urgency', formData.perceived_urgency)

    startTransition(async () => {
      const result = await onSubmit(data)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Maintenance Request Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Solicitação de Manutenção
          </CardTitle>
          <CardDescription>
            Descreva o problema ou serviço de manutenção necessário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Vazamento no banheiro masculino"
              disabled={isPending}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Um título curto e descritivo para o chamado
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Assunto *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
                disabled={isPending}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione o assunto" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tipo de manutenção necessária
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance_type">Tipo de Manutenção</Label>
              <Select
                value={formData.maintenance_type}
                onValueChange={(value) => handleChange('maintenance_type', value)}
                disabled={isPending}
              >
                <SelectTrigger id="maintenance_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Corretiva: reparo; Preventiva: prevenção; Emergencial: urgente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location and Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização e Detalhes
          </CardTitle>
          <CardDescription>
            Onde está o problema e qual equipamento é afetado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unidade {isUnitRequired && <span className="text-destructive">*</span>}
              </Label>

              {showUnitWarning ? (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Você não possui unidades vinculadas. Entre em contato com o administrador.
                  </span>
                </div>
              ) : (
                <>
                  <Select
                    value={formData.unit_id}
                    onValueChange={(value) => handleChange('unit_id', value)}
                    disabled={isPending || isUnitFixed}
                  >
                    <SelectTrigger id="unit_id">
                      <SelectValue
                        placeholder={
                          isUnitFixed
                            ? `${fixedUnit?.code} - ${fixedUnit?.name}`
                            : 'Selecione a unidade'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isUnitFixed && (
                    <p className="text-xs text-muted-foreground">
                      Sua unidade foi selecionada automaticamente
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perceived_urgency">Urgência Percebida</Label>
              <Select
                value={formData.perceived_urgency}
                onValueChange={(value) => handleChange('perceived_urgency', value)}
                disabled={isPending}
              >
                <SelectTrigger id="perceived_urgency">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa - Pode esperar</SelectItem>
                  <SelectItem value="medium">Média - Em breve</SelectItem>
                  <SelectItem value="high">Alta - Urgente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                A prioridade final será definida na triagem.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_description">Local Específico</Label>
            <Input
              id="location_description"
              value={formData.location_description}
              onChange={(e) => handleChange('location_description', e.target.value)}
              placeholder="Ex: 2º andar, banheiro masculino, próximo à escada"
              disabled={isPending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Descreva onde exatamente está o problema
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_affected" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipamento Afetado
            </Label>
            <Input
              id="equipment_affected"
              value={formData.equipment_affected}
              onChange={(e) => handleChange('equipment_affected', e.target.value)}
              placeholder="Ex: Ar condicionado Split LG 12000 BTUs"
              disabled={isPending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Se aplicável, informe qual equipamento precisa de manutenção
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
          <CardDescription>
            Descreva detalhadamente o problema ou serviço necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o problema em detalhes: o que está acontecendo, quando começou, se há riscos de segurança, etc. Quanto mais informações, mais rápido será o atendimento..."
              disabled={isPending}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres. Inclua todos os detalhes relevantes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados/manutencao">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando chamado...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Criar Chamado
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

