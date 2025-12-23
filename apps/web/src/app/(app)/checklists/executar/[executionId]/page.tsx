'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { getExecution, type ExecutionWithDetails } from '../actions'
import { QuestionItem, ExecutionProgress, ExecutionSummary } from '../components'

export default function ExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const executionId = params.executionId as string

  const [execution, setExecution] = useState<ExecutionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false)

  const loadExecution = useCallback(async () => {
    try {
      const data = await getExecution(executionId)
      if (!data) {
        router.push('/checklists/executar')
        return
      }
      setExecution(data)
      
      // Se já está completo, redirecionar
      if (data.status === 'completed') {
        router.push('/checklists')
      }
    } catch (error) {
      console.error('Error loading execution:', error)
      router.push('/checklists/executar')
    } finally {
      setLoading(false)
    }
  }, [executionId, router])

  useEffect(() => {
    loadExecution()
  }, [loadExecution])

  // Refresh execution data periodically for answer updates
  useEffect(() => {
    if (!execution || execution.status === 'completed') return

    const interval = setInterval(loadExecution, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [execution, loadExecution])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!execution) {
    return null
  }

  const activeQuestions = execution.questions.filter(q => q.status === 'active')
  const answersMap = new Map(execution.answers.map(a => [a.question_id, a]))
  const answeredCount = activeQuestions.filter(q => answersMap.has(q.id)).length

  // Check if can show summary
  const requiredAnswered = activeQuestions
    .filter(q => q.is_required)
    .every(q => answersMap.has(q.id))

  const canShowSummary = answeredCount > 0

  if (showSummary) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowSummary(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight truncate">
              Finalizar Checklist
            </h2>
            <p className="text-muted-foreground truncate">
              {execution.unit.name} - {execution.template.name}
            </p>
          </div>
        </div>

        <ExecutionSummary
          executionId={execution.id}
          questions={activeQuestions}
          answers={execution.answers}
          onCancel={() => setShowSummary(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists/executar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight truncate">
              Checklist de Abertura
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{execution.unit.name}</span>
              <Badge variant="outline" className="shrink-0">{execution.unit.code}</Badge>
            </div>
          </div>
        </div>

        {canShowSummary && (
          <Button onClick={() => setShowSummary(true)} className="shrink-0">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Finalizar
          </Button>
        )}
      </div>

      {/* Template Info & Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{execution.template.name}</span>
            </div>
            <ExecutionProgress
              current={answeredCount}
              total={activeQuestions.length}
              className="sm:w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {activeQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Nenhuma pergunta</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Este template não possui perguntas ativas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          activeQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              answer={answersMap.get(question.id)}
              executionId={execution.id}
              questionNumber={index + 1}
              totalQuestions={activeQuestions.length}
            />
          ))
        )}
      </div>

      {/* Footer Actions (Mobile) */}
      {activeQuestions.length > 0 && (
        <div className="sticky bottom-4 sm:hidden">
          <Card className="shadow-lg">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="font-medium">{answeredCount}</span>
                  <span className="text-muted-foreground"> de {activeQuestions.length}</span>
                </div>
                <Button
                  onClick={() => setShowSummary(true)}
                  disabled={!canShowSummary}
                  size="sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-32" />
            <div className="w-64 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-14 flex-1" />
                <Skeleton className="h-14 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

