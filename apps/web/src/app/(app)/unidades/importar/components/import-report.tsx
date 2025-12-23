'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle, XCircle, RefreshCw, ArrowRight, Upload } from 'lucide-react'
import type { ImportResult } from '../actions'

interface ImportReportProps {
  result: ImportResult
  onNewImport: () => void
}

export function ImportReport({ result, onNewImport }: ImportReportProps) {
  const total = result.imported + result.updated + result.errors.length
  const successRate = total > 0 ? Math.round(((result.imported + result.updated) / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Total processado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{result.imported}</div>
            <p className="text-xs text-muted-foreground">Novos inseridos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{result.updated}</div>
            <p className="text-xs text-muted-foreground">Atualizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{result.errors.length}</div>
            <p className="text-xs text-muted-foreground">Com erro</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <Card className={result.errors.length === 0 ? 'border-emerald-200 bg-emerald-50/50' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {result.errors.length === 0 ? (
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            ) : result.imported + result.updated > 0 ? (
              <RefreshCw className="h-8 w-8 text-amber-600" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <div>
              <CardTitle>
                {result.errors.length === 0
                  ? 'Importação concluída com sucesso!'
                  : result.imported + result.updated > 0
                  ? 'Importação parcialmente concluída'
                  : 'Importação falhou'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Taxa de sucesso: {successRate}%
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {result.imported > 0 && (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                {result.imported} nova(s) unidade(s) criada(s)
              </Badge>
            )}
            {result.updated > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                <RefreshCw className="mr-1 h-3 w-3" />
                {result.updated} unidade(s) atualizada(s)
              </Badge>
            )}
            {result.errors.length > 0 && (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                {result.errors.length} erro(s)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erros na Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.map((error, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono">{error.row}</TableCell>
                      <TableCell className="font-medium">{error.name || '-'}</TableCell>
                      <TableCell className="text-destructive text-sm">{error.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onNewImport}>
          <Upload className="mr-2 h-4 w-4" />
          Nova Importação
        </Button>
        <Button asChild>
          <Link href="/unidades">
            Ver Unidades
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

