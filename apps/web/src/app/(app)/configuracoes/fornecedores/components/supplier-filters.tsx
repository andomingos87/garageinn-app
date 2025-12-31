'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUS } from '../constants'
import { useCallback, useState, useTransition } from 'react'

interface SupplierFiltersProps {
  categories: string[]
}

export function SupplierFilters({ categories }: SupplierFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  
  // Get current filter values
  const currentCategory = searchParams.get('category') || ''
  const currentStatus = searchParams.get('status') || 'all'
  
  // Update URL params
  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    startTransition(() => {
      router.push(`/configuracoes/fornecedores?${params.toString()}`)
    })
  }, [router, searchParams])
  
  // Handle search
  const handleSearch = useCallback(() => {
    updateParams('search', search)
  }, [search, updateParams])
  
  // Handle search on Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('')
    startTransition(() => {
      router.push('/configuracoes/fornecedores')
    })
  }, [router])
  
  // Check if has filters
  const hasFilters = search || currentCategory || currentStatus !== 'all'
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ ou contato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>
      
      {/* Category Filter */}
      <Select
        value={currentCategory}
        onValueChange={(value) => updateParams('category', value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas categorias</SelectItem>
          {SUPPLIER_CATEGORIES.map(cat => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Status Filter */}
      <Select
        value={currentStatus}
        onValueChange={(value) => updateParams('status', value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {SUPPLIER_STATUS.map(status => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Search Button */}
      <Button onClick={handleSearch} disabled={isPending}>
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
      
      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      )}
    </div>
  )
}

