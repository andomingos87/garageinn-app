'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Plus, 
  Package, 
  AlertTriangle, 
  PackageMinus,
  History,
  Boxes
} from 'lucide-react'
import { toast } from 'sonner'
import {
  UniformFormDialog,
  UniformTable,
  StockAdjustmentDialog,
  TransactionsTable,
} from './components'
import type { Uniform, UniformStats, UniformTransaction } from './actions'
import {
  getUniforms,
  getUniformStats,
  getUniformTransactions,
  deleteUniform,
  canManageUniforms,
} from './actions'
import { TRANSACTION_TYPES } from './constants'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UniformesConfigPage() {
  const [uniforms, setUniforms] = useState<Uniform[]>([])
  const [transactions, setTransactions] = useState<UniformTransaction[]>([])
  const [stats, setStats] = useState<UniformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canManage, setCanManage] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [editingUniform, setEditingUniform] = useState<Uniform | null>(null)
  const [adjustingUniform, setAdjustingUniform] = useState<Uniform | null>(null)
  const [transactionFilter, setTransactionFilter] = useState('all')

  const loadData = async () => {
    try {
      const [uniformsList, uniformStats, transactionsList, hasPermission] = await Promise.all([
        getUniforms(),
        getUniformStats(),
        getUniformTransactions({ limit: 50 }),
        canManageUniforms(),
      ])
      setUniforms(uniformsList)
      setStats(uniformStats)
      setTransactions(transactionsList)
      setCanManage(hasPermission)
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
    if (!showFormDialog && !showStockDialog) {
      startTransition(() => {
        loadData()
      })
    }
  }, [showFormDialog, showStockDialog])

  // Filter transactions
  useEffect(() => {
    const loadFilteredTransactions = async () => {
      const filtered = await getUniformTransactions({ 
        type: transactionFilter,
        limit: 50 
      })
      setTransactions(filtered)
    }
    if (!isLoading) {
      loadFilteredTransactions()
    }
  }, [transactionFilter, isLoading])

  const handleEditUniform = (uniform: Uniform) => {
    setEditingUniform(uniform)
    setShowFormDialog(true)
  }

  const handleNewUniform = () => {
    setEditingUniform(null)
    setShowFormDialog(true)
  }

  const handleAdjustStock = (uniform: Uniform) => {
    setAdjustingUniform(uniform)
    setShowStockDialog(true)
  }

  const handleDeleteUniform = async (uniformId: string) => {
    startTransition(async () => {
      const result = await deleteUniform(uniformId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Uniforme excluído com sucesso')
        loadData()
      }
    })
  }

  if (!canManage && !isLoading) {
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
            Gestão de Uniformes
          </h2>
          <p className="text-muted-foreground">
            Gerencie o estoque de uniformes e visualize movimentações
          </p>
        </div>
        <Button onClick={handleNewUniform} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Uniforme
        </Button>
      </div>

      <Separator />

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Itens Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats?.total || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total em Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{stats?.totalInStock || 0}</span>
                  <span className="text-sm text-muted-foreground">unidades</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats?.lowStock || 0}</span>
                  {stats?.lowStock && stats.lowStock > 0 && (
                    <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">
                      Atenção
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sem Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <PackageMinus className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold">{stats?.outOfStock || 0}</span>
                  {stats?.outOfStock && stats.outOfStock > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      Crítico
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Estoque e Movimentações */}
          <Tabs defaultValue="estoque" className="w-full">
            <TabsList>
              <TabsTrigger value="estoque" className="gap-2">
                <Package className="h-4 w-4" />
                Estoque
              </TabsTrigger>
              <TabsTrigger value="movimentacoes" className="gap-2">
                <History className="h-4 w-4" />
                Movimentações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estoque" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Itens de Uniforme</CardTitle>
                </CardHeader>
                <CardContent>
                  <UniformTable
                    uniforms={uniforms}
                    onEdit={handleEditUniform}
                    onDelete={handleDeleteUniform}
                    onAdjustStock={handleAdjustStock}
                    isLoading={isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movimentacoes" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Histórico de Movimentações</CardTitle>
                    <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <TransactionsTable transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialogs */}
      <UniformFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        uniform={editingUniform}
      />

      <StockAdjustmentDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        uniform={adjustingUniform}
      />
    </div>
  )
}

