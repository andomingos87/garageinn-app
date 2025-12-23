'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Link2,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Users,
} from 'lucide-react'
import { previewSupervisorLinks, linkSupervisorsFromImport } from '../actions'
import type { SupervisorLinkPreview, SupervisorLinkResult } from '../actions'

export default function VincularSupervisoresPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<SupervisorLinkPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [executionResult, setExecutionResult] = useState<{
    linked: number
    notFound: number
    alreadyLinked: number
    errors: number
    results: SupervisorLinkResult[]
  } | null>(null)

  useEffect(() => {
    loadPreview()
  }, [])

  async function loadPreview() {
    setLoading(true)
    setError(null)
    try {
      const data = await previewSupervisorLinks()
      setPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preview')
    } finally {
      setLoading(false)
    }
  }

  function handleExecuteLink() {
    startTransition(async () => {
      try {
        const result = await linkSupervisorsFromImport()
        setExecutionResult(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao vincular supervisores')
      }
    })
  }

  const getStatusBadge = (status: SupervisorLinkResult['status']) => {
    switch (status) {
      case 'linked':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Vinculado
          </Badge>
        )
      case 'not_found':
        return (
          <Badge variant="destructive">
            <UserX className="mr-1 h-3 w-3" />
            Não encontrado
          </Badge>
        )
      case 'already_linked':
        return (
          <Badge variant="secondary">
            <UserCheck className="mr-1 h-3 w-3" />
            Já vinculado
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Erro
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            Unidades
          </Link>
          <span>/</span>
          <span>Vincular Supervisores</span>
        </div>

        <div className="flex items-center gap-3">
          <Link2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Vincular Supervisores</h2>
        </div>

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
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            Unidades
          </Link>
          <span>/</span>
          <span>Vincular Supervisores</span>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={loadPreview}>Tentar Novamente</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Resultado após execução
  if (executionResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/unidades" className="hover:text-foreground transition-colors">
            Unidades
          </Link>
          <span>/</span>
          <span>Vincular Supervisores</span>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Vinculação Concluída</h2>
        </div>

        {/* Result Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{executionResult.linked}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Já Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{executionResult.alreadyLinked}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Não Encontrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">{executionResult.notFound}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{executionResult.errors}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results List */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Execução</CardTitle>
            <CardDescription>
              Resultado da vinculação para cada unidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {executionResult.results.map((result) => (
                <div
                  key={result.unitId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{result.unitName}</p>
                      <p className="text-xs text-muted-foreground">
                        Supervisor: {result.supervisorName}
                        {result.userName && ` → ${result.userName}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => router.push('/unidades')}>
              Voltar para Unidades
            </Button>
            <Button variant="outline" onClick={() => {
              setExecutionResult(null)
              loadPreview()
            }}>
              Nova Vinculação
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Preview state
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Link href="/unidades" className="hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span>/</span>
        <Link href="/unidades" className="hover:text-foreground transition-colors">
          Unidades
        </Link>
        <span>/</span>
        <span>Vincular Supervisores</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Vincular Supervisores</h2>
            <p className="text-muted-foreground">
              Vincule supervisores do CSV às suas respectivas unidades
            </p>
          </div>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{preview?.total || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">unidades com supervisor</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Podem ser Vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{preview?.canLink || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">supervisores encontrados</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Não Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{preview?.notFound || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">sem usuário correspondente</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Já Vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{preview?.alreadyLinked || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vínculos existentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Preview List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Preview da Vinculação
          </CardTitle>
          <CardDescription>
            Revise os vínculos que serão criados antes de confirmar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preview?.results.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma unidade com supervisor_name encontrada
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {preview?.results.map((result) => (
                <div
                  key={result.unitId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.status === 'linked' 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : result.status === 'not_found'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{result.unitName}</p>
                      <p className="text-xs text-muted-foreground">
                        Supervisor CSV: <span className="font-medium">{result.supervisorName}</span>
                        {result.userName && (
                          <span className="text-green-600"> → {result.userName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(result.status === 'linked' ? 'linked' : result.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/unidades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button 
            onClick={handleExecuteLink} 
            disabled={isPending || !preview?.canLink}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vinculando...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Vincular {preview?.canLink || 0} Supervisor{(preview?.canLink || 0) !== 1 ? 'es' : ''}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Info Box */}
      {preview && preview.notFound > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Supervisores Não Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {preview.notFound} supervisor{preview.notFound !== 1 ? 'es' : ''} do CSV não 
              {preview.notFound !== 1 ? ' foram encontrados' : ' foi encontrado'} no sistema. 
              Para vinculá-los, primeiro cadastre os usuários correspondentes em{' '}
              <Link href="/usuarios/novo" className="text-primary hover:underline">
                Usuários → Novo Usuário
              </Link>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {preview.results
                .filter(r => r.status === 'not_found')
                .slice(0, 10)
                .map(r => (
                  <Badge key={r.unitId} variant="outline" className="text-yellow-700">
                    {r.supervisorName}
                  </Badge>
                ))}
              {preview.results.filter(r => r.status === 'not_found').length > 10 && (
                <Badge variant="outline" className="text-yellow-700">
                  +{preview.results.filter(r => r.status === 'not_found').length - 10} mais
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

