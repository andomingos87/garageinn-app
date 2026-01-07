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
import { Loader2, Save, ArrowLeft, ShoppingCart, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { PurchaseCategory, UserUnit } from '../actions'

interface TicketFormProps {
  categories: PurchaseCategory[]
  units: UserUnit[]
  fixedUnit?: UserUnit | null  // Unidade fixa para Manobrista/Encarregado
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

// Unidades de medida comuns
const UNITS_OF_MEASURE = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'Quilograma(s)' },
  { value: 'g', label: 'Grama(s)' },
  { value: 'l', label: 'Litro(s)' },
  { value: 'ml', label: 'Mililitro(s)' },
  { value: 'm', label: 'Metro(s)' },
  { value: 'm2', label: 'Metro² (m²)' },
  { value: 'm3', label: 'Metro³ (m³)' },
  { value: 'cx', label: 'Caixa(s)' },
  { value: 'pc', label: 'Pacote(s)' },
  { value: 'rl', label: 'Rolo(s)' },
  { value: 'par', label: 'Par(es)' },
  { value: 'jg', label: 'Jogo(s)' },
  { value: 'kit', label: 'Kit(s)' },
]

export function TicketForm({ categories, units, fixedUnit, onSubmit }: TicketFormProps) {
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
    item_name: '',
    quantity: '',
    unit_of_measure: 'un',
    estimated_price: '',
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
    if (!formData.item_name.trim() || formData.item_name.length < 3) {
      setError('Nome do item deve ter pelo menos 3 caracteres')
      return
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Justificativa deve ter pelo menos 10 caracteres')
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
    data.set('item_name', formData.item_name)
    data.set('quantity', formData.quantity)
    data.set('unit_of_measure', formData.unit_of_measure)
    data.set('estimated_price', formData.estimated_price)
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

      {/* Item Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Item para Compra
          </CardTitle>
          <CardDescription>
            Descreva o que você precisa comprar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Compra de material de limpeza"
              disabled={isPending}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Um título curto e descritivo para o chamado
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item_name">Nome do Item *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleChange('item_name', e.target.value)}
                placeholder="Ex: Detergente Neutro 5L"
                disabled={isPending}
              />
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="Ex: 10"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">Unidade de Medida</Label>
              <Select
                value={formData.unit_of_measure}
                onValueChange={(value) => handleChange('unit_of_measure', value)}
                disabled={isPending}
              >
                <SelectTrigger id="unit_of_measure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS_OF_MEASURE.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_price">Preço Estimado (R$)</Label>
              <Input
                id="estimated_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_price}
                onChange={(e) => handleChange('estimated_price', e.target.value)}
                placeholder="Ex: 150.00"
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location and Urgency */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Urgência</CardTitle>
          <CardDescription>
            Onde será utilizado e qual a urgência
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
                    Você não possui unidades vinculadas. Entre em contato com o administrador para vincular sua unidade.
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
                Esta é apenas sua percepção. A prioridade final será definida na triagem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Justification */}
      <Card>
        <CardHeader>
          <CardTitle>Justificativa</CardTitle>
          <CardDescription>
            Explique por que você precisa deste item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Justificativa da Solicitação *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva detalhadamente a necessidade desta compra, para que será utilizado, e qualquer informação relevante para a avaliação..."
              disabled={isPending}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres. Quanto mais detalhado, mais rápida será a análise.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados/compras">
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

