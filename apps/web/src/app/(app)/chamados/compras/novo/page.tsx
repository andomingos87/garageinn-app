import { ShoppingCart } from 'lucide-react'
import { createPurchaseTicket, getPurchaseCategories, getUserUnits } from '../actions'
import { TicketForm } from '../components'

export default async function NovoChamadoComprasPage() {
  const [categories, units] = await Promise.all([
    getPurchaseCategories(),
    getUserUnits(),
  ])

  async function handleCreateTicket(formData: FormData) {
    'use server'
    return createPurchaseTicket(formData)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Novo Chamado de Compras</h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para solicitar a compra de materiais ou equipamentos
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <TicketForm
          categories={categories}
          units={units}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  )
}

