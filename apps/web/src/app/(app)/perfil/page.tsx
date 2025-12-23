import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, Building2, Calendar, Shield, Clock } from 'lucide-react'
import { getCurrentUserProfile } from './actions'
import { ProfileActions } from './components/profile-actions'

function getInitials(name: string) {
    return name
    .split(' ')
      .map((n) => n[0])
    .join('')
      .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCPF(cpf: string | null) {
  if (!cpf) return '-'
  return `***.***.***-${cpf.slice(-2)}`
}

export default async function PerfilPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Agrupar roles
  const globalRoles = profile.roles.filter((r) => r.is_global)
  const departmentRoles = profile.roles.filter((r) => !r.is_global)

  const rolesByDepartment = departmentRoles.reduce((acc, role) => {
    const dept = role.department_name || 'Sem departamento'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(role)
    return acc
  }, {} as Record<string, typeof departmentRoles>)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Visualize e edite suas informações
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {globalRoles.map((role) => (
                  <Badge key={role.role_id} variant="default">
                    {role.role_name}
                  </Badge>
                ))}
                {Object.entries(rolesByDepartment).map(([dept, roles]) =>
                  roles.map((role) => (
                    <Badge key={role.role_id} variant="secondary">
                      {role.role_name} - {dept}
                    </Badge>
                  ))
                )}
                {profile.roles.length === 0 && (
                  <Badge variant="outline">Sem cargo definido</Badge>
                )}
              </div>
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
                <p className="font-medium">{profile.email}</p>
              </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{profile.phone || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Dados Profissionais
            </h3>
            
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

            {profile.roles.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Você ainda não possui cargos atribuídos. Entre em contato com o administrador.
              </p>
            )}
          </div>

          <Separator />

          {/* Security Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Informações de Segurança
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{formatCPF(profile.cpf)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da Conta</p>
                <Badge
                  variant={
                    profile.status === 'active'
                      ? 'default'
                      : profile.status === 'pending'
                      ? 'secondary'
                      : 'outline'
                  }
                  className={
                    profile.status === 'active'
                      ? 'bg-success hover:bg-success/90'
                      : profile.status === 'pending'
                      ? 'bg-warning hover:bg-warning/90'
                      : ''
                  }
                >
                  {profile.status === 'active'
                    ? 'Ativa'
                    : profile.status === 'pending'
                    ? 'Pendente'
                    : 'Inativa'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Histórico
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Última atualização</p>
                <p className="font-medium">{formatDateTime(profile.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <ProfileActions 
            currentPhone={profile.phone} 
            currentAvatarUrl={profile.avatar_url}
            userName={profile.full_name}
          />
        </CardContent>
      </Card>
    </div>
  )
}
