'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Unit, UnitStatus } from '@/lib/supabase/database.types'

interface UnitFormProps {
  unit?: Unit | null
  suggestedCode?: string
  onSubmit: (data: UnitFormData) => Promise<{ success?: boolean; error?: string; unitId?: string }>
}

export interface UnitFormData {
  name: string
  code: string
  address: string
  city?: string | null
  state?: string | null
  zip_code?: string | null
  phone?: string | null
  capacity?: number | null
  status?: UnitStatus
  cnpj?: string | null
  neighborhood?: string | null
  region?: string | null
  administrator?: string | null
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export function UnitForm({ unit, suggestedCode, onSubmit }: UnitFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!unit

  const [formData, setFormData] = useState<UnitFormData>({
    name: unit?.name || '',
    code: unit?.code || suggestedCode || '',
    address: unit?.address || '',
    city: unit?.city || '',
    state: unit?.state || '',
    zip_code: unit?.zip_code || '',
    phone: unit?.phone || '',
    capacity: unit?.capacity || null,
    status: unit?.status || 'active',
    cnpj: unit?.cnpj || '',
    neighborhood: unit?.neighborhood || '',
    region: unit?.region || '',
    administrator: unit?.administrator || '',
  })

  const handleChange = (field: keyof UnitFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.name.trim()) {
      setError('Nome da unidade é obrigatório')
      return
    }
    if (!formData.code.trim()) {
      setError('Código da unidade é obrigatório')
      return
    }
    if (!formData.address.trim()) {
      setError('Endereço é obrigatório')
      return
    }

    startTransition(async () => {
      const result = await onSubmit({
        ...formData,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        phone: formData.phone || null,
        capacity: formData.capacity || null,
        cnpj: formData.cnpj || null,
        neighborhood: formData.neighborhood || null,
        region: formData.region || null,
        administrator: formData.administrator || null,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push(result.unitId ? `/unidades/${result.unitId}` : '/unidades')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Dados principais da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Unidade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Unidade Centro"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Ex: UN001"
                disabled={isPending}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ''}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (vagas)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={formData.capacity || ''}
                onChange={(e) => handleChange('capacity', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ex: 100"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isPending}
              />
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as UnitStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>
            Localização da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, complemento"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood || ''}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Ex: Centro"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code || ''}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                placeholder="00000-000"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ex: São Paulo"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={formData.state || ''}
                onValueChange={(value) => handleChange('state', value)}
                disabled={isPending}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Região</Label>
            <Input
              id="region"
              value={formData.region || ''}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="Ex: Sul, Oeste, Centro"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
          <CardDescription>
            Dados complementares da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="administrator">Administradora</Label>
            <Input
              id="administrator"
              value={formData.administrator || ''}
              onChange={(e) => handleChange('administrator', e.target.value)}
              placeholder="Ex: HERSIL, BARZEL"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" asChild>
          <Link href="/unidades">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Salvar Alterações' : 'Criar Unidade'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

