import { Users } from 'lucide-react'
import { createRHTicket, getRHCategories, getUniforms } from '../actions'
import { getUserUnits } from '../../compras/actions'
import { RHTicketForm } from '../components/rh-ticket-form'
import { redirect } from 'next/navigation'

export default async function NovoChamadoRHPage() {
  const [categories, units, uniforms] = await Promise.all([
    getRHCategories(),
    getUserUnits(),
    getUniforms(),
  ])

  async function handleCreateTicket(formData: FormData) {
    'use server'
    const result = await createRHTicket(formData)
    
    if (result.success && result.ticketId) {
      redirect(`/chamados/rh/${result.ticketId}`)
    }
    
    return result
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Novo Chamado de RH</h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para enviar sua solicitação ao departamento de Recursos Humanos
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <RHTicketForm
          categories={categories}
          units={units}
          uniforms={uniforms}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  )
}

