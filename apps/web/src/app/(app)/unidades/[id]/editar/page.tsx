import { redirect, notFound } from 'next/navigation'
import { checkIsAdmin, getUnitById, updateUnit } from '../../actions'
import { UnitForm, type UnitFormData } from '../../components/unit-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarUnidadePage({ params }: PageProps) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const unit = await getUnitById(id)

  if (!unit) {
    notFound()
  }

  async function handleUpdateUnit(data: UnitFormData) {
    'use server'
    const result = await updateUnit(id, data)
    return { ...result, unitId: id }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Editar Unidade</h2>
        <p className="text-muted-foreground">
          Altere as informações da unidade {unit.name}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <UnitForm unit={unit} onSubmit={handleUpdateUnit} />
      </div>
    </div>
  )
}

