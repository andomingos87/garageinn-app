import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getUserById, getDepartments, getRoles, checkIsAdmin } from '../../actions'
import { UserEditForm } from './components/user-edit-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params

  const [user, departments, allRoles, isAdmin] = await Promise.all([
    getUserById(id),
    getDepartments(),
    getRoles(),
    checkIsAdmin(),
  ])

  if (!isAdmin) {
    redirect('/')
  }

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/usuarios/${user.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Editar Usuário</h2>
          <p className="text-muted-foreground">
            Atualize as informações de {user.full_name}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              Edite os dados cadastrais e cargos do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserEditForm 
              user={user} 
              departments={departments} 
              allRoles={allRoles}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

