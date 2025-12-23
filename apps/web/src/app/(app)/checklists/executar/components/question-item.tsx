'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, X, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveAnswer } from '../actions'

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

interface QuestionItemProps {
  question: Question
  answer?: Answer
  executionId: string
  questionNumber: number
  totalQuestions: number
}

export function QuestionItem({
  question,
  answer,
  executionId,
  questionNumber,
  totalQuestions,
}: QuestionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [localAnswer, setLocalAnswer] = useState<boolean | null>(answer?.answer ?? null)
  const [localObservation, setLocalObservation] = useState(answer?.observation || '')
  const [showObservation, setShowObservation] = useState(
    answer?.observation ? true : (answer?.answer === false && question.requires_observation_on_no)
  )

  const isAnswered = localAnswer !== null
  const requiresObservation = localAnswer === false && question.requires_observation_on_no
  const showObservationWarning = requiresObservation && !localObservation.trim()

  const handleAnswerClick = async (value: boolean) => {
    setLocalAnswer(value)
    
    // Mostrar campo de observação se responder "Não" e exigir observação
    if (value === false && question.requires_observation_on_no) {
      setShowObservation(true)
    }

    startTransition(async () => {
      const result = await saveAnswer(executionId, question.id, value, localObservation || undefined)
      if (result.error) {
        console.error(result.error)
        // Reverter em caso de erro
        setLocalAnswer(answer?.answer ?? null)
      }
    })
  }

  const handleObservationBlur = () => {
    if (localAnswer !== null && localObservation !== (answer?.observation || '')) {
      startTransition(async () => {
        const result = await saveAnswer(executionId, question.id, localAnswer, localObservation || undefined)
        if (result.error) {
          console.error(result.error)
        }
      })
    }
  }

  const toggleObservation = () => {
    setShowObservation(!showObservation)
  }

  return (
    <Card className={cn(
      'transition-all',
      isAnswered && localAnswer === true && 'border-success/30 bg-success/5',
      isAnswered && localAnswer === false && 'border-destructive/30 bg-destructive/5'
    )}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">
                  {questionNumber} de {totalQuestions}
                </span>
                {question.is_required && (
                  <Badge variant="outline" className="text-xs">
                    Obrigatória
                  </Badge>
                )}
                {question.requires_observation_on_no && (
                  <Badge variant="outline" className="text-xs text-warning border-warning/30">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Obs. se Não
                  </Badge>
                )}
              </div>
              <p className="text-base font-medium leading-relaxed">
                {question.question_text}
              </p>
            </div>

            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>

          {/* Answer Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant={localAnswer === true ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'flex-1 h-14 text-base font-medium transition-all',
                localAnswer === true && 'bg-success hover:bg-success/90 border-success'
              )}
              onClick={() => handleAnswerClick(true)}
              disabled={isPending}
            >
              <Check className="mr-2 h-5 w-5" />
              Sim
            </Button>
            <Button
              type="button"
              variant={localAnswer === false ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'flex-1 h-14 text-base font-medium transition-all',
                localAnswer === false && 'bg-destructive hover:bg-destructive/90 border-destructive'
              )}
              onClick={() => handleAnswerClick(false)}
              disabled={isPending}
            >
              <X className="mr-2 h-5 w-5" />
              Não
            </Button>
          </div>

          {/* Observation Toggle */}
          {!requiresObservation && isAnswered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={toggleObservation}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {showObservation ? 'Ocultar observação' : 'Adicionar observação'}
            </Button>
          )}

          {/* Observation Field */}
          {showObservation && (
            <div className="space-y-2">
              <Label htmlFor={`observation-${question.id}`} className="flex items-center gap-2">
                Observação
                {requiresObservation && (
                  <span className="text-destructive text-xs">*Obrigatória para resposta &quot;Não&quot;</span>
                )}
              </Label>
              <Textarea
                id={`observation-${question.id}`}
                placeholder="Digite sua observação..."
                value={localObservation}
                onChange={(e) => setLocalObservation(e.target.value)}
                onBlur={handleObservationBlur}
                rows={3}
                className={cn(
                  showObservationWarning && 'border-destructive'
                )}
              />
              {showObservationWarning && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Esta pergunta exige observação quando a resposta é &quot;Não&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

