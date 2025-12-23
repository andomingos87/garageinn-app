'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { TemplateCard } from './template-card'
import { deleteTemplate, updateTemplate } from '../actions'
import type { TemplateWithDetails } from '../actions'

interface TemplatesGridProps {
  templates: TemplateWithDetails[]
}

export function TemplatesGrid({ templates }: TemplatesGridProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (templateId: string) => {
    startTransition(async () => {
      const result = await deleteTemplate(templateId)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleToggleStatus = async (templateId: string, newStatus: 'active' | 'inactive') => {
    startTransition(async () => {
      const formData = new FormData()
      const template = templates.find(t => t.id === templateId)
      if (template) {
        formData.append('name', template.name)
        formData.append('description', template.description || '')
        formData.append('is_default', String(template.is_default))
        formData.append('status', newStatus)
        
        // updateTemplate faz redirect, então precisamos apenas chamar
        try {
          await updateTemplate(templateId, formData)
        } catch {
          // redirect throws, isso é esperado
        }
      }
    })
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nenhum template encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Crie um novo template para começar a configurar checklists.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      ))}
    </div>
  )
}

