import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { checkIsAdmin, createTemplate } from '../actions'
import { TemplateForm } from '../components'

export default async function NovoTemplatePage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/checklists/configurar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Novo Template</h2>
          <p className="text-muted-foreground">
            Crie um novo template de checklist
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Template</CardTitle>
          <CardDescription>
            Defina o nome, descrição e tipo do template. Após criar, você poderá
            adicionar as perguntas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm action={createTemplate} />
        </CardContent>
      </Card>
    </div>
  )
}

