import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { checkIsAdmin, getTemplateById, updateTemplate } from '../../actions'
import { TemplateForm } from '../../components'

interface PageProps {
  params: Promise<{
    templateId: string
  }>
}

export default async function EditarTemplatePage({ params }: PageProps) {
  const { templateId } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const template = await getTemplateById(templateId)

  if (!template) {
    notFound()
  }

  const handleUpdate = async (formData: FormData) => {
    'use server'
    return updateTemplate(templateId, formData)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/checklists/configurar/${templateId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Editar Template</h2>
          <p className="text-muted-foreground">{template.name}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Template</CardTitle>
          <CardDescription>
            Atualize as informações do template de checklist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm
            action={handleUpdate}
            defaultValues={{
              name: template.name,
              description: template.description,
              type: template.type,
              is_default: template.is_default,
              status: template.status,
            }}
            isEdit
          />
        </CardContent>
      </Card>
    </div>
  )
}

