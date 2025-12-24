'use client'

import { useEffect, useState, useTransition, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Building2, Pencil, Plus, Trash2, Users, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { RolesList, RoleFormDialog, DepartmentFormDialog } from '../components'
import type { DepartmentWithRoles, Role, Department } from '../actions'
import { getDepartmentById, deleteDepartment, checkIsAdmin } from '../actions'

interface PageProps {
  params: Promise<{ id: string }>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DepartmentDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [department, setDepartment] = useState<DepartmentWithRoles | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const loadData = async () => {
    try {
      const [dept, admin] = await Promise.all([
        getDepartmentById(id),
        checkIsAdmin(),
      ])
      setDepartment(dept)
      setIsAdmin(admin)
    } catch (error) {
      console.error('Error loading department:', error)
      toast.error('Erro ao carregar departamento')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  // Reload data when dialogs close
  useEffect(() => {
    if (!showEditDialog && !showRoleDialog) {
      startTransition(() => {
        loadData()
      })
    }
  }, [showEditDialog, showRoleDialog])

  const handleDelete = () => {
    if (!department) return

    startTransition(async () => {
      const result = await deleteDepartment(department.id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Departamento excluído com sucesso')
        router.push('/configuracoes/departamentos')
      }
      setShowDeleteDialog(false)
    })
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowRoleDialog(true)
  }

  const handleNewRole = () => {
    setEditingRole(null)
    setShowRoleDialog(true)
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Departamento não encontrado</h2>
        <p className="text-muted-foreground">
          O departamento solicitado não existe ou foi removido.
        </p>
        <Button asChild>
          <Link href="/configuracoes/departamentos">Voltar</Link>
        </Button>
      </div>
    )
  }

  // Convert to Department type for the dialog
  const departmentForDialog: Department = {
    id: department.id,
    name: department.name,
    created_at: department.created_at,
    roles_count: department.roles_count,
    users_count: department.users_count,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes/departamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {department.name}
            </h2>
            <p className="text-muted-foreground">
              Gerenciar cargos e visualizar usuários
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditDialog(true)}
            disabled={isPending}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending || department.roles_count > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cargos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{department.roles_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Vinculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{department.users_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criado em
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-lg">
              {new Date(department.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Cargos do Departamento</CardTitle>
            <CardDescription>
              Gerencie os cargos vinculados a este departamento
            </CardDescription>
          </div>
          <Button onClick={handleNewRole} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cargo
          </Button>
        </CardHeader>
        <CardContent>
          {department.roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum cargo cadastrado
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando o primeiro cargo deste departamento.
              </p>
              <Button onClick={handleNewRole}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Cargo
              </Button>
            </div>
          ) : (
            <RolesList
              roles={department.roles}
              departmentId={department.id}
              onEdit={handleEditRole}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DepartmentFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        department={departmentForDialog}
      />

      <RoleFormDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        role={editingRole}
        departmentId={department.id}
        departmentName={department.name}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir departamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o departamento <strong>{department.name}</strong>?
              Esta ação não pode ser desfeita.
              {department.roles_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Este departamento possui {department.roles_count} cargo(s) vinculado(s).
                  Remova os cargos antes de excluir.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending || department.roles_count > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

