'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle2, Clock, FileText, PlayCircle, Loader2 } from 'lucide-react'
import { startExecution, type AvailableChecklist } from '../actions'

interface ExecutionStartCardProps {
  checklist: AvailableChecklist
}

export function ExecutionStartCard({ checklist }: ExecutionStartCardProps) {
  const [isPending, startTransition] = useTransition()
  
  const { unit, template, todayExecution } = checklist

  const isCompleted = todayExecution?.status === 'completed'
  const isInProgress = todayExecution?.status === 'in_progress'

  const handleStart = () => {
    startTransition(async () => {
      const result = await startExecution(unit.id, template.id)
      if (result?.error) {
        // Toast will be shown by the redirect or error handling
        console.error(result.error)
      }
    })
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="default" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Concluído
        </Badge>
      )
    }
    if (isInProgress) {
      return (
        <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
          <Clock className="mr-1 h-3 w-3" />
          Em andamento
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-warning border-warning/30">
        <Clock className="mr-1 h-3 w-3" />
        Pendente
      </Badge>
    )
  }

  const getButtonContent = () => {
    if (isPending) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </>
      )
    }
    if (isInProgress) {
      return (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Continuar
        </>
      )
    }
    if (isCompleted) {
      return (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Concluído
        </>
      )
    }
    return (
      <>
        <PlayCircle className="mr-2 h-4 w-4" />
        Iniciar
      </>
    )
  }

  return (
    <Card className={isCompleted ? 'opacity-75' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base truncate flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              {unit.name}
            </CardTitle>
            <CardDescription className="text-xs">
              Código: {unit.code}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{template.name}</span>
          <Badge variant="outline" className="text-xs">
            {template.questions_count} {template.questions_count === 1 ? 'pergunta' : 'perguntas'}
          </Badge>
        </div>

        <Button
          onClick={handleStart}
          disabled={isPending || isCompleted}
          className="w-full"
          variant={isInProgress ? 'secondary' : 'default'}
          size="lg"
        >
          {getButtonContent()}
        </Button>
      </CardContent>
    </Card>
  )
}

