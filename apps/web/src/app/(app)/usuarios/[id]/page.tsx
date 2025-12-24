import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Pencil,
  Shield,
  Send,
} from 'lucide-react'
import { getUserById, checkIsAdmin } from '../actions'
import { UserStatusActions } from './components/user-status-actions'
import { InvitationStatusBadge } from '../components/invitation-status-badge'
import type { UserStatus } from '@/lib/supabase/database.types'
import { getInvitationStatus } from '@/lib/supabase/database.types'

interface PageProps {
  params: Promise<{ id: string }>
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusConfig(status: UserStatus) {
  switch (status) {
    case 'active':
      return { label: 'Ativo', className: 'bg-success hover:bg-success/90' }
    case 'pending':
      return { label: 'Pendente', className: 'bg-warning hover:bg-warning/90 text-warning-foreground' }
    case 'inactive':
      return { label: 'Inativo', className: '' }
    default:
      return { label: status, className: '' }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatCPF(cpf: string | null) {
  if (!cpf) return '-'
  // Mostrar apenas os últimos 2 dígitos
  return `***.***.***-${cpf.slice(-2)}`
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const [user, isAdmin] = await Promise.all([
    getUserById(id),
    checkIsAdmin(),
  ])

  if (!isAdmin) {
    redirect('/')
  }

  if (!user) {
    notFound()
  }

  const statusConfig = getStatusConfig(user.status)
  const invitationStatus = getInvitationStatus(user)

  // Agrupar roles por tipo
  const globalRoles = user.roles.filter((r) => r.is_global)
  const departmentRoles = user.roles.filter((r) => !r.is_global)

  // Agrupar por departamento
  const rolesByDepartment = departmentRoles.reduce((acc, role) => {
    const dept = role.department_name || 'Sem departamento'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(role)
    return acc
  }, {} as Record<string, typeof departmentRoles>)

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
        <div className="flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">Detalhes do Usuário</h2>
          <p className="text-muted-foreground">
            Visualize as informações do usuário
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/usuarios/${user.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                  <Badge variant="secondary" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                  <InvitationStatusBadge
                    status={invitationStatus}
                    sentAt={user.invitation_sent_at}
                    expiresAt={user.invitation_expires_at}
                  />
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Dados de Contato
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{user.phone || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Roles Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Cargos e Departamentos
              </h3>

              {/* Global Roles */}
              {globalRoles.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cargos Globais</p>
                  <div className="flex flex-wrap gap-2">
                    {globalRoles.map((role) => (
                      <Badge key={role.role_id} variant="default">
                        {role.role_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Roles */}
              {Object.entries(rolesByDepartment).map(([dept, roles]) => (
                <div key={dept}>
                  <p className="text-sm text-muted-foreground mb-2">{dept}</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role.role_id} variant="outline">
                        {role.role_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {user.roles.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum cargo atribuído
                </p>
              )}
            </div>

            <Separator />

            {/* Security Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Informações Adicionais
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{formatCPF(user.cpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UserStatusActions 
                userId={user.id} 
                userName={user.full_name}
                userEmail={user.email}
                currentStatus={user.status}
                invitationStatus={invitationStatus}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <span className="font-medium">Criado em:</span>{' '}
                {formatDate(user.created_at)}
              </p>
              <p>
                <span className="font-medium">Atualizado em:</span>{' '}
                {formatDate(user.updated_at)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

