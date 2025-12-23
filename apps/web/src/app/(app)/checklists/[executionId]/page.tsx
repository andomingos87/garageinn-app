import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { getExecutionDetails, checkIsAdmin } from '../actions'
import { DeleteExecutionButton } from './components/delete-execution-button'

interface PageProps {
  params: Promise<{
    executionId: string
  }>
}

async function ExecutionDetailsContent({
  executionId,
  isAdmin,
}: {
  executionId: string
  isAdmin: boolean
}) {
  const execution = await getExecutionDetails(executionId)

  if (!execution) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} às ${formatTime(dateString)}`
  }

  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const nonConformitiesCount = execution.answers.filter((a) => !a.answer).length
  const conformitiesCount = execution.answers.filter((a) => a.answer).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/checklists">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Detalhes do Checklist
            </h2>
            <p className="text-muted-foreground">
              {execution.template?.name} - {execution.unit?.name}
            </p>
          </div>
        </div>

        {isAdmin && (
          <DeleteExecutionButton executionId={execution.id} />
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {execution.status === 'completed' ? (
                execution.has_non_conformities ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Com Pendências
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Concluído
                  </>
                )
              ) : (
                <>
                  <Clock className="h-4 w-4 text-info" />
                  Em Andamento
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-bold text-success">{conformitiesCount}</div>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{nonConformitiesCount}</div>
                <p className="text-xs text-muted-foreground">Não-conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unit Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{execution.unit?.name}</div>
            <Badge variant="outline" className="mt-1">
              {execution.unit?.code}
            </Badge>
          </CardContent>
        </Card>

        {/* Date Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data/Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>Início: {formatDateTime(execution.started_at)}</div>
              {execution.completed_at && (
                <div className="text-muted-foreground">
                  Fim: {formatTime(execution.completed_at)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Executor Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Executado por
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={execution.executed_by_profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(execution.executed_by_profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">
                  {execution.executed_by_profile?.full_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {execution.executed_by_profile?.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Respostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {execution.answers.map((answer, index) => (
              <div
                key={answer.id}
                className={`rounded-lg border p-4 ${
                  !answer.answer
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">
                      {index + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{answer.question?.question_text}</p>
                      {answer.question?.is_required && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Obrigatória
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {answer.answer ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="mr-1 h-3 w-3" />
                        Não
                      </Badge>
                    )}
                  </div>
                </div>

                {answer.observation && (
                  <div className="mt-3 pl-6 border-l-2 border-muted">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                      {answer.observation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Observations */}
      {execution.general_observations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {execution.general_observations}
            </p>
          </CardContent>
        </Card>
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
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Answers */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ExecutionDetailsPage({ params }: PageProps) {
  const { executionId } = await params
  const isAdmin = await checkIsAdmin()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ExecutionDetailsContent executionId={executionId} isAdmin={isAdmin} />
    </Suspense>
  )
}

