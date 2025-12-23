'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Check, Info, Minus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { DepartmentFilter, PermissionsMatrix } from './components'
import {
  checkIsAdmin,
  getDepartmentsWithRolesAndPermissions,
  getGlobalRolesWithPermissions,
} from './actions'
import {
  PERMISSION_GROUPS,
  type DepartmentWithRoles,
  type RoleWithPermissions,
} from './constants'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Legend */}
      <Skeleton className="h-12 w-full" />

      {/* Matrix Cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <div className="p-6 pb-3">
            <Skeleton className="h-5 w-32" />
          </div>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PermissoesPage() {
  const [departments, setDepartments] = useState<DepartmentWithRoles[]>([])
  const [globalRoles, setGlobalRoles] = useState<RoleWithPermissions[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [depts, global, admin] = await Promise.all([
        getDepartmentsWithRolesAndPermissions(),
        getGlobalRolesWithPermissions(),
        checkIsAdmin(),
      ])
      setDepartments(depts)
      setGlobalRoles(global)
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

  // Filtra os cargos baseado no departamento selecionado
  const getFilteredRoles = (): RoleWithPermissions[] => {
    if (selectedDepartment === null) {
      // Todos: globais + todos os departamentos
      const allDeptRoles = departments.flatMap((d) => d.roles)
      return [...globalRoles, ...allDeptRoles]
    }

    if (selectedDepartment === 'global') {
      return globalRoles
    }

    const dept = departments.find((d) => d.id === selectedDepartment)
    return dept?.roles || []
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground/50" />
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

  const filteredRoles = getFilteredRoles()

  // Prepara dados para o filtro de departamentos
  const departmentFilterData = departments.map((d) => ({
    id: d.id,
    name: d.name,
    rolesCount: d.roles.length,
  }))

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
          <h2 className="text-2xl font-semibold tracking-tight">Permissões</h2>
          <p className="text-muted-foreground">
            Visualize as permissões de cada cargo no sistema
          </p>
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Info Banner */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
            <CardContent className="flex items-start gap-3 py-4">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Permissões definidas em código
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  As permissões estão configuradas no arquivo{' '}
                  <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                    permissions.ts
                  </code>
                  . Para alterar as permissões de um cargo, é necessário modificar o código-fonte.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Department Filter */}
          <DepartmentFilter
            departments={departmentFilterData}
            globalRolesCount={globalRoles.length}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
          />

          {/* Legend */}
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="font-medium text-muted-foreground">Legenda:</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Permissão concedida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>Herdado de admin:all</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-muted/50">
                    <Minus className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <span>Sem permissão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Admin</Badge>
                  <span>Acesso total ao sistema</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <PermissionsMatrix
            roles={filteredRoles}
            permissionGroups={PERMISSION_GROUPS}
            showDepartment={selectedDepartment === null}
          />
        </>
      )}
    </div>
  )
}
