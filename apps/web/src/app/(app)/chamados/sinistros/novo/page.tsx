import { AlertTriangle } from 'lucide-react'
import { createClaimTicket, getClaimCategories, getUserUnits } from '../actions'
import { ClaimForm } from '../components'

export default async function NovoSinistroPage() {
  const [categories, units] = await Promise.all([
    getClaimCategories(),
    getUserUnits(),
  ])

  async function handleCreateClaim(formData: FormData) {
    'use server'
    return createClaimTicket(formData)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold tracking-tight">Registrar Sinistro</h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para registrar uma ocorrência de sinistro
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ClaimForm
          categories={categories}
          units={units}
          onSubmit={handleCreateClaim}
        />
      </div>
    </div>
  )
}

