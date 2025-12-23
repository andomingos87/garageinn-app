import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getDepartments, getRoles, checkIsAdmin, getUnits } from '../actions'
import { NewUserForm } from './components/new-user-form'

export default async function NewUserPage() {
  const [departments, allRoles, units, isAdmin] = await Promise.all([
    getDepartments(),
    getRoles(),
    getUnits(),
    checkIsAdmin(),
  ])

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/usuarios">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Novo Usuário</h2>
          <p className="text-muted-foreground">
            Adicione um novo usuário ao sistema
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Preencha os dados do novo usuário. Um email de convite será enviado automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewUserForm departments={departments} allRoles={allRoles} units={units} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

