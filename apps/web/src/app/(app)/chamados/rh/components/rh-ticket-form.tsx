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
import { Loader2, Save, ArrowLeft, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { RHCategory, Uniform } from '../actions'
import type { UserUnit } from '@/lib/units'
import { RH_TYPES, WITHDRAWAL_REASONS } from '../constants'

interface RHTicketFormProps {
  categories: RHCategory[]
  units: UserUnit[]
  fixedUnit?: UserUnit | null  // Unidade fixa para Manobrista/Encarregado
  uniforms: Uniform[]
  onSubmit: (formData: FormData) => Promise<{ error?: string; ticketId?: string } | void>
}

export function RHTicketForm({ categories, units, fixedUnit, uniforms, onSubmit }: RHTicketFormProps) {
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
    rh_type: '',
    withdrawal_reason: '',
    uniform_id: '',
    quantity: '1',
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
    if (!formData.rh_type) {
      setError('Tipo de chamado de RH é obrigatório')
      return
    }
    if (formData.rh_type === 'uniform') {
      if (!formData.uniform_id) {
        setError('Selecione um uniforme')
        return
      }
      if (!formData.withdrawal_reason) {
        setError('Selecione o motivo da retirada')
        return
      }
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
    data.set('rh_type', formData.rh_type)
    data.set('withdrawal_reason', formData.withdrawal_reason)
    data.set('uniform_id', formData.uniform_id)
    data.set('quantity', formData.quantity)
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

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
          <CardDescription>
            Defina o assunto principal da sua solicitação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Solicitação de novo uniforme"
              disabled={isPending}
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rh_type">Tipo de Solicitação *</Label>
              <Select
                value={formData.rh_type}
                onValueChange={(value) => handleChange('rh_type', value)}
                disabled={isPending}
              >
                <SelectTrigger id="rh_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {RH_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
                disabled={isPending}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uniform Specific Fields */}
      {formData.rh_type === 'uniform' && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle>Detalhes do Uniforme</CardTitle>
            <CardDescription>
              Selecione o item e o motivo da solicitação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="uniform_id">Item do Uniforme *</Label>
                <Select
                  value={formData.uniform_id}
                  onValueChange={(value) => handleChange('uniform_id', value)}
                  disabled={isPending}
                >
                  <SelectTrigger id="uniform_id">
                    <SelectValue placeholder="Selecione o item" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniforms.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} {u.size ? `(${u.size})` : ''} - Estoque: {u.current_stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal_reason">Motivo da Retirada *</Label>
                <Select
                  value={formData.withdrawal_reason}
                  onValueChange={(value) => handleChange('withdrawal_reason', value)}
                  disabled={isPending}
                >
                  <SelectTrigger id="withdrawal_reason">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {WITHDRAWAL_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full sm:w-1/3 space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location and Urgency */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Urgência</CardTitle>
          <CardDescription>
            Unidade relacionada e nível de prioridade percebida
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição / Justificativa</CardTitle>
          <CardDescription>
            Detalhe sua necessidade para a equipe de RH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva detalhadamente sua solicitação..."
              disabled={isPending}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados">
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

