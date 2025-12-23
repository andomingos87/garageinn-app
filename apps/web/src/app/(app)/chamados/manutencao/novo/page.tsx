import { Wrench } from 'lucide-react'
import { createMaintenanceTicket, getMaintenanceCategories, getUserUnits } from '../actions'
import { MaintenanceTicketForm } from '../components'

export default async function NovoChamadoManutencaoPage() {
  const [categories, units] = await Promise.all([
    getMaintenanceCategories(),
    getUserUnits(),
  ])

  async function handleCreateTicket(formData: FormData) {
    'use server'
    return createMaintenanceTicket(formData)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Novo Chamado de Manutenção</h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para solicitar um serviço de manutenção
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <MaintenanceTicketForm
          categories={categories}
          units={units}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  )
}

