'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { addQuestion, updateQuestion } from '../actions'
import type { Database } from '@/lib/supabase/database.types'

type Question = Database['public']['Tables']['checklist_questions']['Row']

interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  question?: Question | null
  onSuccess?: () => void
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  templateId,
  question,
  onSuccess,
}: QuestionFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!question

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEdit
        ? await updateQuestion(question.id, templateId, formData)
        : await addQuestion(templateId, formData)

      if (result.error) {
        setError(result.error)
      } else {
        onOpenChange(false)
        onSuccess?.()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Pergunta' : 'Nova Pergunta'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique os campos da pergunta abaixo.'
              : 'Adicione uma nova pergunta ao checklist.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question_text">Texto da Pergunta *</Label>
            <Textarea
              id="question_text"
              name="question_text"
              placeholder="Ex: As luzes de emergência estão funcionando?"
              defaultValue={question?.question_text || ''}
              required
              minLength={5}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 5 caracteres
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_required"
              name="is_required"
              value="true"
              defaultChecked={question?.is_required ?? true}
            />
            <Label htmlFor="is_required" className="font-normal cursor-pointer">
              Pergunta obrigatória
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requires_observation_on_no"
              name="requires_observation_on_no"
              value="true"
              defaultChecked={question?.requires_observation_on_no ?? false}
            />
            <Label
              htmlFor="requires_observation_on_no"
              className="font-normal cursor-pointer"
            >
              Exigir observação quando resposta for &quot;Não&quot;
            </Label>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={question?.status || 'active'}>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

