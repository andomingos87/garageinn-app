'use client'

import { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface CSVDropzoneProps {
  onParse: (data: Record<string, string>[], headers: string[]) => void
  onError: (error: string) => void
  onClear: () => void
}

export function CSVDropzone({ onParse, onError, onClear }: CSVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      onError('Apenas arquivos .csv são permitidos')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('Arquivo muito grande. Máximo permitido: 5MB')
      return
    }

    setFileName(file.name)
    setIsLoading(true)

    // Parse com encoding Latin-1 para UTF-8
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      encoding: 'ISO-8859-1',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        setIsLoading(false)
        
        if (results.errors.length > 0) {
          console.error('Parse errors:', results.errors)
          onError(`Erro no parsing: ${results.errors[0].message}`)
          return
        }
        
        const data = results.data as Record<string, string>[]
        const headers = results.meta.fields || []
        
        if (data.length === 0) {
          onError('Arquivo CSV está vazio')
          return
        }
        
        onParse(data, headers)
      },
      error: (error) => {
        setIsLoading(false)
        onError(`Erro ao ler arquivo: ${error.message}`)
      },
    })
  }, [onParse, onError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleRemove = () => {
    setFileName(null)
    onClear()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (fileName) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{fileName}</p>
              <p className="text-xs text-muted-foreground">Arquivo carregado</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
          <Upload className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="font-medium">
            {isLoading ? 'Processando arquivo...' : 'Arraste um arquivo CSV aqui'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou clique para selecionar
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Máximo 5MB • Formato: CSV separado por ponto e vírgula (;)</span>
        </div>
      </div>
    </div>
  )
}

