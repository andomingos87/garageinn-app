'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Globe, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import {
  DepartmentCard,
  DepartmentFormDialog,
  RolesList,
  RoleFormDialog,
} from './components'
import type { Department, Role } from './actions'
import { getDepartments, getGlobalRoles, checkIsAdmin } from './actions'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DepartamentosPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [globalRoles, setGlobalRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const loadData = async () => {
    try {
      const [depts, roles, admin] = await Promise.all([
        getDepartments(),
        getGlobalRoles(),
        checkIsAdmin(),
      ])
      setDepartments(depts)
      setGlobalRoles(roles)
      setIsAdmin(admin)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reload data when dialogs close
  useEffect(() => {
    if (!showDepartmentDialog && !showRoleDialog) {
      startTransition(() => {
        loadData()
      })
    }
  }, [showDepartmentDialog, showRoleDialog])

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department)
    setShowDepartmentDialog(true)
  }

  const handleNewDepartment = () => {
    setEditingDepartment(null)
    setShowDepartmentDialog(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowRoleDialog(true)
  }

  const handleNewGlobalRole = () => {
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
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  const totalRoles = departments.reduce((sum, d) => sum + d.roles_count, 0) + globalRoles.length
  const totalUsers = departments.reduce((sum, d) => sum + d.users_count, 0) +
    globalRoles.reduce((sum, r) => sum + r.users_count, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Departamentos e Cargos
          </h2>
          <p className="text-muted-foreground">
            Gerencie a estrutura organizacional da empresa
          </p>
        </div>
        <Button onClick={handleNewDepartment} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Departamento
        </Button>
      </div>

      <Separator />

      {/* Stats */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{departments.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cargos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{totalRoles}</span>
                <Badge variant="secondary" className="ml-2">
                  {globalRoles.length} globais
                </Badge>
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
                <span className="text-2xl font-bold">{totalUsers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments" className="gap-2">
              <Building2 className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="global-roles" className="gap-2">
              <Globe className="h-4 w-4" />
              Cargos Globais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            {departments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum departamento cadastrado
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comece criando o primeiro departamento da sua organização.
                  </p>
                  <Button onClick={handleNewDepartment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Departamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <DepartmentCard
                    key={department.id}
                    department={department}
                    onEdit={handleEditDepartment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global-roles" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Cargos Globais</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cargos que não pertencem a um departamento específico
                  </p>
                </div>
                <Button onClick={handleNewGlobalRole} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cargo Global
                </Button>
              </CardHeader>
              <CardContent>
                <RolesList
                  roles={globalRoles}
                  onEdit={handleEditRole}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      <DepartmentFormDialog
        open={showDepartmentDialog}
        onOpenChange={setShowDepartmentDialog}
        department={editingDepartment}
      />

      <RoleFormDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        role={editingRole}
      />
    </div>
  )
}

