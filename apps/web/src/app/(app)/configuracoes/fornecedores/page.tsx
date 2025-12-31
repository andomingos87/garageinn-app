import { Metadata } from 'next'
import { Suspense } from 'react'
import { Building2 } from 'lucide-react'
import { getSuppliers, getSupplierCategories } from './actions'
import { SupplierFormDialog, SupplierTable, SupplierFilters } from './components'

export const metadata: Metadata = {
  title: 'Fornecedores Credenciados | Configurações',
  description: 'Gerencie os fornecedores credenciados do sistema'
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    status?: string
  }>
}

export default async function FornecedoresPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  // Buscar dados em paralelo
  const [suppliers, categories] = await Promise.all([
    getSuppliers({
      search: params.search,
      category: params.category,
      status: params.status as 'active' | 'inactive' | 'all' | undefined
    }),
    getSupplierCategories()
  ])
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Fornecedores Credenciados
          </h1>
          <p className="text-muted-foreground">
            Gerencie os fornecedores credenciados para cotações de sinistros
          </p>
        </div>
        <SupplierFormDialog />
      </div>
      
      {/* Filters */}
      <Suspense fallback={null}>
        <SupplierFilters categories={categories} />
      </Suspense>
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{suppliers.length}</strong> fornecedor(es) encontrado(s)
        </span>
        {params.search && (
          <span>
            • Buscando por: <strong className="text-foreground">{params.search}</strong>
          </span>
        )}
      </div>
      
      {/* Table */}
      <SupplierTable 
        suppliers={suppliers.map(s => ({
          ...s,
          is_active: s.is_active ?? true
        }))} 
      />
    </div>
  )
}

