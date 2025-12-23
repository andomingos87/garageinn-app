import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { checkIsAdmin, getTemplateById, getQuestions } from '../../actions'
import { QuestionsList } from '../../components'

interface PageProps {
  params: Promise<{
    templateId: string
  }>
}

export default async function GerenciarPerguntasPage({ params }: PageProps) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/checklists/configurar/${templateId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">
                Gerenciar Perguntas
              </h2>
              <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                {template.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{template.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Checklist</CardTitle>
          <CardDescription>
            Adicione, edite ou reordene as perguntas do checklist. Arraste para
            alterar a ordem de exibição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionsList questions={questions} templateId={templateId} />
        </CardContent>
      </Card>
    </div>
  )
}

