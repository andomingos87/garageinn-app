'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileSpreadsheet, CheckCircle } from 'lucide-react'
import { CSVDropzone } from './components/csv-dropzone'
import { ImportPreview, type ParsedUnit } from './components/import-preview'
import { ImportReport } from './components/import-report'
import { importUnits, getNextUnitCodeStart, type ImportUnitData, type ImportResult } from './actions'

type ImportStep = 'upload' | 'preview' | 'result'

// Mapeamento de colunas do CSV para campos do sistema
const CSV_COLUMN_MAP: Record<string, keyof ImportUnitData | null> = {
  'QTD': null, // Ignorar
  'UNIDADE': 'name',
  'VAGAS': 'capacity',
  'CNPJ': 'cnpj',
  'APP Omie': null, // Ignorar
  'SUPERVISOR': 'supervisor_name',
  'ADMINISTRADORA': 'administrator',
  'ENDEREÇO': 'address',
  'BAIRRO': 'neighborhood',
  'REGIÃO': 'region',
  'CIDADE': 'city',
  'ESTADO': 'state',
}

export default function ImportarUnidadesPage() {
  const [step, setStep] = useState<ImportStep>('upload')
  const [error, setError] = useState<string | null>(null)
  const [parsedUnits, setParsedUnits] = useState<ParsedUnit[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const resetState = () => {
    setStep('upload')
    setError(null)
    setParsedUnits([])
    setImportResult(null)
  }

  const handleParse = useCallback(async (data: Record<string, string>[], headers: string[]) => {
    setError(null)

    // Verificar headers esperados
    const hasNameColumn = headers.some((h) => h.toUpperCase().includes('UNIDADE'))
    const hasAddressColumn = headers.some((h) => h.toUpperCase().includes('ENDERE'))

    if (!hasNameColumn) {
      setError('Coluna "UNIDADE" não encontrada no CSV')
      return
    }

    if (!hasAddressColumn) {
      setError('Coluna "ENDEREÇO" não encontrada no CSV')
      return
    }

    // Buscar próximo código disponível
    let nextCodeNumber: number
    try {
      nextCodeNumber = await getNextUnitCodeStart()
    } catch {
      nextCodeNumber = 1
    }

    // Processar dados
    const units: ParsedUnit[] = []
    const nameSet = new Set<string>()

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowIndex = i + 2 // +2 porque linha 1 é header e índice começa em 0

      // Encontrar valor de cada campo
      let name = ''
      let address = ''
      let city: string | null = null
      let state: string | null = null
      let capacity: number | null = null
      let cnpj: string | null = null
      let neighborhood: string | null = null
      let region: string | null = null
      let administrator: string | null = null
      let supervisorName: string | null = null

      for (const [csvCol, fieldName] of Object.entries(CSV_COLUMN_MAP)) {
        if (!fieldName) continue

        // Encontrar a coluna no CSV (case-insensitive e com encoding corrigido)
        const csvKey = Object.keys(row).find(
          (k) => k.toUpperCase().replace(/[^A-Z]/g, '') === csvCol.toUpperCase().replace(/[^A-Z]/g, '')
        )

        if (!csvKey) continue

        const value = row[csvKey]?.trim() || ''

        switch (fieldName) {
          case 'name':
            name = value
            break
          case 'address':
            address = value
            break
          case 'city':
            city = value || null
            break
          case 'state':
            state = value || null
            break
          case 'capacity':
            const cap = parseInt(value, 10)
            capacity = !isNaN(cap) && cap > 0 ? cap : null
            break
          case 'cnpj':
            cnpj = value || null
            break
          case 'neighborhood':
            neighborhood = value || null
            break
          case 'region':
            region = value || null
            break
          case 'administrator':
            administrator = value || null
            break
          case 'supervisor_name':
            supervisorName = value || null
            break
        }
      }

      // Ignorar linhas vazias
      if (!name && !address) continue

      // Validação
      const errors: string[] = []
      if (!name) errors.push('Nome é obrigatório')
      if (!address) errors.push('Endereço é obrigatório')

      // Verificar duplicata interna
      const isDuplicate = nameSet.has(name.toLowerCase())
      if (!isDuplicate) {
        nameSet.add(name.toLowerCase())
      }

      // Gerar código
      const code = `UN${String(nextCodeNumber + i).padStart(3, '0')}`

      units.push({
        rowIndex,
        name,
        code,
        address,
        city,
        state,
        capacity,
        cnpj,
        neighborhood,
        region,
        administrator,
        supervisor_name: supervisorName,
        isValid: errors.length === 0,
        errors,
        isDuplicate,
      })
    }

    if (units.length === 0) {
      setError('Nenhuma unidade válida encontrada no CSV')
      return
    }

    setParsedUnits(units)
    setStep('preview')
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const handleClear = useCallback(() => {
    setError(null)
    setParsedUnits([])
  }, [])

  const handleConfirmImport = () => {
    startTransition(async () => {
      const validUnits = parsedUnits
        .filter((u) => u.isValid)
        .map((u): ImportUnitData => ({
          name: u.name,
          code: u.code,
          address: u.address,
          city: u.city,
          state: u.state,
          capacity: u.capacity,
          cnpj: u.cnpj,
          neighborhood: u.neighborhood,
          region: u.region,
          administrator: u.administrator,
          supervisor_name: u.supervisor_name,
        }))

      try {
        const result = await importUnits(validUnits)
        setImportResult(result)
        setStep('result')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao importar unidades')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/unidades">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Importar Unidades</h2>
          <p className="text-muted-foreground">
            Importe unidades em massa a partir de um arquivo CSV
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          Upload
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          Preview
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step === 'result' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'result' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <CheckCircle className="h-4 w-4" />
          </div>
          Resultado
        </div>
      </div>

      {/* Content based on step */}
      {step === 'upload' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Upload do Arquivo CSV
              </CardTitle>
              <CardDescription>
                Envie um arquivo CSV com as unidades a serem importadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <CSVDropzone
                onParse={handleParse}
                onError={handleError}
                onClear={handleClear}
              />

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Formato esperado:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Arquivo CSV separado por ponto e vírgula (;)</li>
                  <li>Encoding: ISO-8859-1 (Latin-1) ou UTF-8</li>
                  <li>Colunas obrigatórias: UNIDADE, ENDEREÇO</li>
                  <li>Colunas opcionais: VAGAS, CNPJ, SUPERVISOR, ADMINISTRADORA, BAIRRO, REGIÃO, CIDADE, ESTADO</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'preview' && (
        <ImportPreview
          parsedUnits={parsedUnits}
          onConfirm={handleConfirmImport}
          onCancel={resetState}
          isLoading={isPending}
        />
      )}

      {step === 'result' && importResult && (
        <ImportReport result={importResult} onNewImport={resetState} />
      )}
    </div>
  )
}

