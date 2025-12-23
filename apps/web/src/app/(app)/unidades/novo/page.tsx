import { redirect } from 'next/navigation'
import { checkIsAdmin, generateUnitCode, createUnit } from '../actions'
import { UnitForm, type UnitFormData } from '../components/unit-form'

export default async function NovaUnidadePage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const suggestedCode = await generateUnitCode()

  async function handleCreateUnit(data: UnitFormData) {
    'use server'
    return createUnit(data)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Nova Unidade</h2>
        <p className="text-muted-foreground">
          Cadastre uma nova unidade da rede Garageinn
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <UnitForm suggestedCode={suggestedCode} onSubmit={handleCreateUnit} />
      </div>
    </div>
  )
}

