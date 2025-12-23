import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Hash,
  Calendar,
  Users,
  Pencil,
  ArrowLeft,
  CarFront,
  FileText,
  MapPinned,
  Briefcase,
} from 'lucide-react'
import { checkIsAdmin, getUnitById, getUnitStaff } from '../actions'
import { UnitStatusBadge } from '../components/unit-status-badge'
import { UnitStatusActions } from './components/unit-status-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UnitDetailsPage({ params }: PageProps) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const [unit, staff] = await Promise.all([
    getUnitById(id),
    getUnitStaff(id),
  ])

  if (!unit) {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/unidades" className="hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span>/</span>
            <Link href="/unidades" className="hover:text-foreground transition-colors">
              Unidades
            </Link>
            <span>/</span>
            <span className="font-mono text-xs">{unit.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">{unit.name}</h2>
            <UnitStatusBadge status={unit.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UnitStatusActions unitId={unit.id} currentStatus={unit.status} />
          <Button asChild>
            <Link href={`/unidades/${unit.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Código</p>
                    <p className="text-sm text-muted-foreground font-mono">{unit.code}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CarFront className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Capacidade</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.capacity ? `${unit.capacity.toLocaleString('pt-BR')} vagas` : 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">CNPJ</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {unit.cnpj || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.phone || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.email ? (
                        <a href={`mailto:${unit.email}`} className="hover:text-primary hover:underline">
                          {unit.email}
                        </a>
                      ) : (
                        'Não informado'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Administradora</p>
                    <p className="text-sm text-muted-foreground">
                      {unit.administrator || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cadastrada em</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(unit.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">{unit.address}</p>
                <p className="text-sm text-muted-foreground">
                  {[unit.neighborhood, unit.city, unit.state].filter(Boolean).join(', ') || 'Localização não informada'}
                </p>
                {unit.zip_code && (
                  <p className="text-sm text-muted-foreground font-mono">
                    CEP: {unit.zip_code}
                  </p>
                )}
              </div>
              {unit.region && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <MapPinned className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Região:</span>
                  <Badge variant="outline">{unit.region}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Equipe Vinculada
                </CardTitle>
                <Badge variant="secondary">{staff.length} funcionário{staff.length !== 1 ? 's' : ''}</Badge>
              </div>
              <CardDescription>
                Funcionários vinculados a esta unidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhum funcionário vinculado a esta unidade
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/usuarios">
                      Gerenciar Usuários
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {staff.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user_avatar || undefined} />
                        <AvatarFallback>{getInitials(member.user_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{member.user_name}</p>
                          {member.is_coverage && (
                            <Badge variant="outline" className="text-xs">
                              Cobertura
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
                      </div>
                      {member.role_name && (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{member.role_name}</p>
                          {member.department_name && (
                            <p className="text-xs text-muted-foreground">{member.department_name}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <UnitStatusBadge status={unit.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Capacidade</span>
                <span className="text-sm font-medium">
                  {unit.capacity ? `${unit.capacity.toLocaleString('pt-BR')} vagas` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Equipe</span>
                <span className="text-sm font-medium">{staff.length} pessoa{staff.length !== 1 ? 's' : ''}</span>
              </div>
              {unit.region && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Região</span>
                  <span className="text-sm font-medium">{unit.region}</span>
                </div>
              )}
              {unit.supervisor_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Supervisor</span>
                  <span className="text-sm font-medium">{unit.supervisor_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/unidades/${unit.id}/editar`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Unidade
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/usuarios">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

