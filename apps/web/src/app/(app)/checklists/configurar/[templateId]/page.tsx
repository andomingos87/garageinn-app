import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Pencil,
  ListChecks,
  Building2,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { checkIsAdmin, getTemplateById, getQuestions } from '../actions'
import { UnitAssignmentButton } from './components/unit-assignment-button'

interface PageProps {
  params: Promise<{
    templateId: string
  }>
}

export default async function TemplateDetailsPage({ params }: PageProps) {
  const { templateId } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const [template, questions] = await Promise.all([
    getTemplateById(templateId),
    getQuestions(templateId),
  ])

  if (!template) {
    notFound()
  }

  const activeQuestions = questions.filter((q) => q.status === 'active')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checklists/configurar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">
                {template.name}
              </h2>
              <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                {template.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {template.description || 'Sem descrição'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/checklists/configurar/${templateId}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/checklists/configurar/${templateId}/perguntas`}>
              <ListChecks className="mr-2 h-4 w-4" />
              Gerenciar Perguntas
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <Badge variant="outline">
                {template.type === 'opening' ? 'Abertura' : 'Supervisão'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Template Padrão</span>
              <span>{template.is_default ? 'Sim' : 'Não'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Perguntas</span>
              <div className="flex items-center gap-1">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <span>
                  {activeQuestions.length} ativa{activeQuestions.length !== 1 ? 's' : ''}
                </span>
                {questions.length > activeQuestions.length && (
                  <span className="text-muted-foreground">
                    ({questions.length - activeQuestions.length} inativa
                    {questions.length - activeQuestions.length !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Criado em</span>
              <div className="flex items-center gap-1 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {template.created_at
                  ? new Date(template.created_at).toLocaleDateString('pt-BR')
                  : '-'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Atualizado em</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {template.updated_at
                  ? new Date(template.updated_at).toLocaleDateString('pt-BR')
                  : '-'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Unidades Vinculadas</CardTitle>
              <CardDescription>
                {template.units.length} unidade{template.units.length !== 1 ? 's' : ''} usando
                este template
              </CardDescription>
            </div>
            <UnitAssignmentButton templateId={templateId} />
          </CardHeader>
          <CardContent>
            {template.units.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma unidade vinculada
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vincule unidades para que possam usar este checklist
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {template.units.map((unit: { id: string; name: string; code: string }) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">{unit.code}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/unidades/${unit.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Perguntas</CardTitle>
            <CardDescription>
              Preview das perguntas ativas deste template
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/checklists/configurar/${templateId}/perguntas`}>
              Gerenciar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ListChecks className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma pergunta cadastrada
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href={`/checklists/configurar/${templateId}/perguntas`}>
                  Adicionar perguntas
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {activeQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <span className="text-muted-foreground font-medium">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p>{question.question_text}</p>
                    <div className="flex gap-2 mt-1">
                      {question.is_required && (
                        <Badge variant="secondary" className="text-xs">
                          Obrigatória
                        </Badge>
                      )}
                      {question.requires_observation_on_no && (
                        <Badge variant="outline" className="text-xs">
                          Obs. se &quot;Não&quot;
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

