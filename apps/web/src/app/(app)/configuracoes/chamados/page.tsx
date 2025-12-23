'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Tag, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  CategoryTable,
  CategoryFormDialog,
  DepartmentTabs,
} from './components'
import type { Department, TicketCategory, CategoryStats } from './actions'
import {
  getCategories,
  getDepartmentsWithCategories,
  getCategoryStats,
  toggleCategoryStatus,
  deleteCategory,
  checkIsAdmin,
} from './actions'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
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

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ChamadosConfigPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>('all')

  const loadData = async () => {
    try {
      const [cats, depts, categoryStats, admin] = await Promise.all([
        getCategories(),
        getDepartmentsWithCategories(),
        getCategoryStats(),
        checkIsAdmin(),
      ])
      setCategories(cats)
      setDepartments(depts)
      setStats(categoryStats)
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

  // Reload data when dialog closes
  useEffect(() => {
    if (!showCategoryDialog) {
      startTransition(() => {
        loadData()
      })
    }
  }, [showCategoryDialog])

  const handleEditCategory = (category: TicketCategory) => {
    setEditingCategory(category)
    setShowCategoryDialog(true)
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    setShowCategoryDialog(true)
  }

  const handleToggleStatus = async (categoryId: string) => {
    startTransition(async () => {
      const result = await toggleCategoryStatus(categoryId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          result.newStatus === 'active'
            ? 'Categoria ativada'
            : 'Categoria desativada'
        )
        loadData()
      }
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    startTransition(async () => {
      const result = await deleteCategory(categoryId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Categoria excluída com sucesso')
        loadData()
      }
    })
  }

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId === 'all' ? null : departmentId)
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
            Categorias de Chamados
          </h2>
          <p className="text-muted-foreground">
            Gerencie as categorias e tipos de chamados por departamento
          </p>
        </div>
        <Button onClick={handleNewCategory} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Separator />

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats?.total || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Categorias Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{stats?.active || 0}</span>
                  <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
                    {stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Categorias Inativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">{stats?.inactive || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories by Department */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhuma categoria cadastrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando a primeira categoria de chamados.
                  </p>
                  <Button onClick={handleNewCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Categoria
                  </Button>
                </div>
              ) : (
                <DepartmentTabs
                  departments={departments}
                  categories={categories}
                  selectedDepartment={selectedDepartment}
                  onDepartmentChange={handleDepartmentChange}
                  onEditCategory={handleEditCategory}
                  onToggleStatus={handleToggleStatus}
                  onDeleteCategory={handleDeleteCategory}
                  isLoading={isPending}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog */}
      <CategoryFormDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        category={editingCategory}
        departments={departments}
        defaultDepartmentId={selectedDepartment}
      />
    </div>
  )
}

