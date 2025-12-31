'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft, AlertTriangle, Car, User, Users, MapPin, FileImage, Calendar } from 'lucide-react'
import Link from 'next/link'
import { OCCURRENCE_TYPES } from '../constants'
import type { ClaimCategory, UserUnit } from '../actions'

interface ClaimFormProps {
  categories: ClaimCategory[]
  units: UserUnit[]
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

// Máscara para placa de veículo (AAA-0000 ou AAA0A00 Mercosul)
function formatPlate(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`
}

// Máscara para telefone
function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

// Máscara para CPF
function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

export function ClaimForm({ categories, units, onSubmit }: ClaimFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [hasThirdParty, setHasThirdParty] = useState(false)
  
  const [formData, setFormData] = useState({
    // Identificação
    title: '',
    unit_id: '',
    category_id: '',
    occurrence_type: '',
    // Ocorrência
    occurrence_date: '',
    occurrence_time: '',
    location_description: '',
    police_report_number: '',
    // Veículo
    vehicle_plate: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_year: '',
    // Cliente
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_cpf: '',
    // Terceiro
    third_party_name: '',
    third_party_phone: '',
    third_party_plate: '',
    // Descrição
    description: '',
    perceived_urgency: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handlePlateChange = (field: string, value: string) => {
    handleChange(field, formatPlate(value))
  }

  const handlePhoneChange = (field: string, value: string) => {
    handleChange(field, formatPhone(value))
  }

  const handleCPFChange = (value: string) => {
    handleChange('customer_cpf', formatCPF(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Título deve ter pelo menos 5 caracteres')
      return
    }
    if (!formData.unit_id) {
      setError('Selecione a unidade')
      return
    }
    if (!formData.category_id) {
      setError('Selecione a categoria do sinistro')
      return
    }
    if (!formData.occurrence_type) {
      setError('Selecione o tipo de ocorrência')
      return
    }
    if (!formData.occurrence_date) {
      setError('Informe a data da ocorrência')
      return
    }
    if (!formData.vehicle_plate.trim()) {
      setError('Informe a placa do veículo')
      return
    }
    if (!formData.customer_name.trim()) {
      setError('Informe o nome do cliente')
      return
    }
    if (!formData.customer_phone.trim()) {
      setError('Informe o telefone do cliente')
      return
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      setError('Descrição deve ter pelo menos 20 caracteres')
      return
    }

    const data = new FormData()
    // Identificação
    data.set('title', formData.title)
    data.set('unit_id', formData.unit_id)
    data.set('category_id', formData.category_id)
    data.set('occurrence_type', formData.occurrence_type)
    // Ocorrência
    data.set('occurrence_date', formData.occurrence_date)
    data.set('occurrence_time', formData.occurrence_time)
    data.set('location_description', formData.location_description)
    data.set('police_report_number', formData.police_report_number)
    // Veículo
    data.set('vehicle_plate', formData.vehicle_plate.replace(/-/g, ''))
    data.set('vehicle_make', formData.vehicle_make)
    data.set('vehicle_model', formData.vehicle_model)
    data.set('vehicle_color', formData.vehicle_color)
    data.set('vehicle_year', formData.vehicle_year)
    // Cliente
    data.set('customer_name', formData.customer_name)
    data.set('customer_phone', formData.customer_phone.replace(/\D/g, ''))
    data.set('customer_email', formData.customer_email)
    data.set('customer_cpf', formData.customer_cpf.replace(/\D/g, ''))
    // Terceiro
    data.set('has_third_party', hasThirdParty.toString())
    if (hasThirdParty) {
      data.set('third_party_name', formData.third_party_name)
      data.set('third_party_phone', formData.third_party_phone.replace(/\D/g, ''))
      data.set('third_party_plate', formData.third_party_plate.replace(/-/g, ''))
    }
    // Descrição
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

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Identificação do Sinistro
          </CardTitle>
          <CardDescription>
            Informações básicas sobre o sinistro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Chamado *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Colisão no estacionamento - veículo ABC-1234"
              disabled={isPending}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Um título curto e descritivo para o sinistro
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unidade *</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(value) => handleChange('unit_id', value)}
                disabled={isPending}
              >
                <SelectTrigger id="unit_id">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
                disabled={isPending}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione a categoria" />
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occurrence_type">Tipo de Ocorrência *</Label>
              <Select
                value={formData.occurrence_type}
                onValueChange={(value) => handleChange('occurrence_type', value)}
                disabled={isPending}
              >
                <SelectTrigger id="occurrence_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {OCCURRENCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Dados da Ocorrência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dados da Ocorrência
          </CardTitle>
          <CardDescription>
            Quando e onde aconteceu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="occurrence_date">Data da Ocorrência *</Label>
              <Input
                id="occurrence_date"
                type="date"
                value={formData.occurrence_date}
                onChange={(e) => handleChange('occurrence_date', e.target.value)}
                disabled={isPending}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occurrence_time">Hora</Label>
              <Input
                id="occurrence_time"
                type="time"
                value={formData.occurrence_time}
                onChange={(e) => handleChange('occurrence_time', e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="police_report_number">Nº B.O.</Label>
              <Input
                id="police_report_number"
                value={formData.police_report_number}
                onChange={(e) => handleChange('police_report_number', e.target.value)}
                placeholder="Ex: 123456/2024"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_description">Local Específico</Label>
            <Input
              id="location_description"
              value={formData.location_description}
              onChange={(e) => handleChange('location_description', e.target.value)}
              placeholder="Ex: Vaga 42 - 2º subsolo"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Veículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Dados do Veículo
          </CardTitle>
          <CardDescription>
            Informações do veículo afetado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_plate">Placa *</Label>
              <Input
                id="vehicle_plate"
                value={formData.vehicle_plate}
                onChange={(e) => handlePlateChange('vehicle_plate', e.target.value)}
                placeholder="ABC-1234"
                disabled={isPending}
                maxLength={8}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_make">Marca</Label>
              <Input
                id="vehicle_make"
                value={formData.vehicle_make}
                onChange={(e) => handleChange('vehicle_make', e.target.value)}
                placeholder="Ex: Volkswagen"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Modelo</Label>
              <Input
                id="vehicle_model"
                value={formData.vehicle_model}
                onChange={(e) => handleChange('vehicle_model', e.target.value)}
                placeholder="Ex: Gol"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_color">Cor</Label>
              <Input
                id="vehicle_color"
                value={formData.vehicle_color}
                onChange={(e) => handleChange('vehicle_color', e.target.value)}
                placeholder="Ex: Prata"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_year">Ano</Label>
              <Input
                id="vehicle_year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.vehicle_year}
                onChange={(e) => handleChange('vehicle_year', e.target.value)}
                placeholder="Ex: 2020"
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
          <CardDescription>
            Informações do proprietário/responsável
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nome Completo *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="Nome do cliente"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefone *</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => handlePhoneChange('customer_phone', e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isPending}
                maxLength={15}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_email">E-mail</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                placeholder="email@exemplo.com"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_cpf">CPF</Label>
              <Input
                id="customer_cpf"
                value={formData.customer_cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder="000.000.000-00"
                disabled={isPending}
                maxLength={14}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terceiro Envolvido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Terceiro Envolvido
          </CardTitle>
          <CardDescription>
            Informações de terceiro, se houver
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="has_third_party"
              checked={hasThirdParty}
              onCheckedChange={setHasThirdParty}
              disabled={isPending}
            />
            <Label htmlFor="has_third_party">Houve terceiro envolvido?</Label>
          </div>

          {hasThirdParty && (
            <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="third_party_name">Nome do Terceiro</Label>
                <Input
                  id="third_party_name"
                  value={formData.third_party_name}
                  onChange={(e) => handleChange('third_party_name', e.target.value)}
                  placeholder="Nome do terceiro"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="third_party_phone">Telefone</Label>
                <Input
                  id="third_party_phone"
                  value={formData.third_party_phone}
                  onChange={(e) => handlePhoneChange('third_party_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  disabled={isPending}
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="third_party_plate">Placa do Veículo</Label>
                <Input
                  id="third_party_plate"
                  value={formData.third_party_plate}
                  onChange={(e) => handlePlateChange('third_party_plate', e.target.value)}
                  placeholder="ABC-1234"
                  disabled={isPending}
                  maxLength={8}
                  className="uppercase"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descrição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Descrição Detalhada
          </CardTitle>
          <CardDescription>
            Descreva o que aconteceu com o máximo de detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Sinistro *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva detalhadamente o que aconteceu, como foi identificado o dano, testemunhas, etc..."
              disabled={isPending}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 20 caracteres. Quanto mais detalhado, melhor a análise.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="ghost" asChild>
          <Link href="/chamados/sinistros">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando sinistro...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Registrar Sinistro
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

