'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Check, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { completeExecution } from '../actions'

interface Question {
  id: string
  question_text: string
  order_index: number
  is_required: boolean | null
  requires_observation_on_no: boolean | null
}

interface Answer {
  id: string
  question_id: string
  answer: boolean
  observation: string | null
}

interface ExecutionSummaryProps {
  executionId: string
  questions: Question[]
  answers: Answer[]
  onCancel: () => void
}

export function ExecutionSummary({
  executionId,
  questions,
  answers,
  onCancel,
}: ExecutionSummaryProps) {
  const [isPending, startTransition] = useTransition()
  const [generalObservations, setGeneralObservations] = useState('')
  const [error, setError] = useState<string | null>(null)

  const answersMap = new Map(answers.map(a => [a.question_id, a]))

  const yesCount = answers.filter(a => a.answer === true).length
  const noCount = answers.filter(a => a.answer === false).length
  const unansweredRequired = questions.filter(
    q => q.is_required && !answersMap.has(q.id)
  )
  const missingObservations = questions.filter(q => {
    const ans = answersMap.get(q.id)
    return q.requires_observation_on_no && ans?.answer === false && !ans.observation
  })

  const nonConformities = questions
    .filter(q => answersMap.get(q.id)?.answer === false)
    .map(q => ({
      question: q,
      answer: answersMap.get(q.id)!,
    }))

  const canComplete = unansweredRequired.length === 0 && missingObservations.length === 0

  const handleComplete = () => {
    if (!canComplete) return

    setError(null)
    startTransition(async () => {
      const result = await completeExecution(executionId, generalObservations || undefined)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Resumo do Checklist
        </CardTitle>
        <CardDescription>
          Revise as respostas antes de finalizar
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{answers.length}</p>
            <p className="text-xs text-muted-foreground">Respondidas</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg">
            <p className="text-2xl font-bold text-success">{yesCount}</p>
            <p className="text-xs text-success">Sim</p>
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            noCount > 0 ? 'bg-destructive/10' : 'bg-muted'
          )}>
            <p className={cn(
              'text-2xl font-bold',
              noCount > 0 ? 'text-destructive' : ''
            )}>
              {noCount}
            </p>
            <p className={cn(
              'text-xs',
              noCount > 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              Não
            </p>
          </div>
        </div>

        {/* Validation Errors */}
        {(unansweredRequired.length > 0 || missingObservations.length > 0) && (
          <div className="space-y-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pendências
            </p>
            {unansweredRequired.length > 0 && (
              <p className="text-sm text-destructive">
                {unansweredRequired.length} {unansweredRequired.length === 1 ? 'pergunta obrigatória não respondida' : 'perguntas obrigatórias não respondidas'}
              </p>
            )}
            {missingObservations.length > 0 && (
              <p className="text-sm text-destructive">
                {missingObservations.length} {missingObservations.length === 1 ? 'observação obrigatória faltando' : 'observações obrigatórias faltando'}
              </p>
            )}
          </div>
        )}

        {/* Non-conformities */}
        {nonConformities.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium flex items-center gap-2">
              <X className="h-4 w-4 text-destructive" />
              Não-conformidades ({nonConformities.length})
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {nonConformities.map(({ question, answer }) => (
                <div
                  key={question.id}
                  className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                >
                  <p className="text-sm font-medium">{question.question_text}</p>
                  {answer.observation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Obs: {answer.observation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conformities summary */}
        {yesCount > 0 && nonConformities.length === 0 && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="font-medium text-success flex items-center gap-2">
              <Check className="h-4 w-4" />
              Todas as verificações estão em conformidade!
            </p>
          </div>
        )}

        {/* General Observations */}
        <div className="space-y-2">
          <Label htmlFor="general-observations">Observações Gerais (opcional)</Label>
          <Textarea
            id="general-observations"
            placeholder="Adicione observações gerais sobre este checklist..."
            value={generalObservations}
            onChange={(e) => setGeneralObservations(e.target.value)}
            rows={3}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 border-t pt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1"
        >
          Revisar
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isPending || !canComplete}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Checklist
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

