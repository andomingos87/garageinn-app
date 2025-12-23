'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import type { ImportUnitData } from '../actions'

export interface ParsedUnit extends ImportUnitData {
  rowIndex: number
  isValid: boolean
  errors: string[]
  isDuplicate: boolean
}

interface ImportPreviewProps {
  parsedUnits: ParsedUnit[]
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function ImportPreview({
  parsedUnits,
  onConfirm,
  onCancel,
  isLoading,
}: ImportPreviewProps) {
  const stats = useMemo(() => {
    const valid = parsedUnits.filter((u) => u.isValid && !u.isDuplicate).length
    const withErrors = parsedUnits.filter((u) => !u.isValid).length
    const duplicates = parsedUnits.filter((u) => u.isDuplicate).length
    return { total: parsedUnits.length, valid, withErrors, duplicates }
  }, [parsedUnits])

  const previewUnits = parsedUnits.slice(0, 15)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.valid}</div>
            <p className="text-xs text-muted-foreground">Novos válidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.duplicates}</div>
            <p className="text-xs text-muted-foreground">Serão atualizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.withErrors}</div>
            <p className="text-xs text-muted-foreground">Com erros</p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preview dos Dados</CardTitle>
          <CardDescription>
            Mostrando os primeiros {previewUnits.length} de {parsedUnits.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead className="w-20">Vagas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewUnits.map((unit) => (
                  <TableRow
                    key={unit.rowIndex}
                    className={
                      !unit.isValid
                        ? 'bg-destructive/5'
                        : unit.isDuplicate
                        ? 'bg-amber-500/5'
                        : ''
                    }
                  >
                    <TableCell className="font-mono text-xs">{unit.rowIndex}</TableCell>
                    <TableCell>
                      {unit.isValid ? (
                        unit.isDuplicate ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Atualizar
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Novo
                          </Badge>
                        )
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={unit.name}>
                      {unit.name || <span className="text-destructive">Vazio</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{unit.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={unit.address}>
                      {unit.address || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{unit.city || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{unit.region || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="text-right">
                      {unit.capacity?.toLocaleString('pt-BR') || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Error Details */}
          {stats.withErrors > 0 && (
            <div className="mt-4 p-4 bg-destructive/5 rounded-md border border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">Erros encontrados:</h4>
              <ul className="text-sm space-y-1">
                {parsedUnits
                  .filter((u) => !u.isValid)
                  .slice(0, 5)
                  .map((u) => (
                    <li key={u.rowIndex} className="text-destructive">
                      Linha {u.rowIndex}: {u.errors.join(', ')}
                    </li>
                  ))}
                {stats.withErrors > 5 && (
                  <li className="text-muted-foreground">
                    ... e mais {stats.withErrors - 5} erros
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stats.valid + stats.duplicates} registro(s) serão processados
          {stats.withErrors > 0 && ` (${stats.withErrors} ignorados por erros)`}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || (stats.valid === 0 && stats.duplicates === 0)}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar {stats.valid + stats.duplicates} unidade(s)
          </Button>
        </div>
      </div>
    </div>
  )
}

