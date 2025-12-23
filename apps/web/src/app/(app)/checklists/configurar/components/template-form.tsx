'use client'

import { useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface TemplateFormProps {
  action: (formData: FormData) => void
  defaultValues?: {
    name?: string
    description?: string | null
    type?: string
    is_default?: boolean | null
    status?: string
  }
  isEdit?: boolean
}

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEdit ? 'Salvar Alterações' : 'Criar Template'}
    </Button>
  )
}

export function TemplateForm({ action, defaultValues, isEdit }: TemplateFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Template *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Checklist de Abertura - Padrão"
            defaultValue={defaultValues?.name}
            required
            minLength={3}
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 3 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Descrição opcional do template..."
            defaultValue={defaultValues?.description || ''}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select name="type" defaultValue={defaultValues?.type || 'opening'}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opening">Abertura</SelectItem>
              <SelectItem value="supervision">Supervisão</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Abertura: executado no início das operações. Supervisão: executado por supervisores.
          </p>
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={defaultValues?.status || 'active'}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            name="is_default"
            value="true"
            defaultChecked={defaultValues?.is_default || false}
          />
          <Label htmlFor="is_default" className="font-normal cursor-pointer">
            Definir como template padrão para novas unidades
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancelar
        </Button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}

