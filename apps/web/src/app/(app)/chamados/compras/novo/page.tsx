import { ShoppingCart } from 'lucide-react'
import { createPurchaseTicket, getPurchaseCategories, getUserUnits, getUserFixedUnit } from '../actions'
import { TicketForm } from '../components'

export default async function NovoChamadoComprasPage() {
  const [categories, units, fixedUnit] = await Promise.all([
    getPurchaseCategories(),
    getUserUnits(),
    getUserFixedUnit(),
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
          fixedUnit={fixedUnit}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  )
}

