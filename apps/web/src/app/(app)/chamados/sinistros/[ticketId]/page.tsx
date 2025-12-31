import { notFound } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

interface PageProps {
  params: Promise<{
    ticketId: string
  }>
}

// Placeholder para a página de detalhes - será implementada na Fase 3
export default async function SinistroDetailsPage({ params }: PageProps) {
  const { ticketId } = await params
  
  if (!ticketId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold tracking-tight">Detalhes do Sinistro</h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Página de detalhes do sinistro #{ticketId}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Esta página será implementada na Fase 3 do plano de implementação.
        </p>
      </div>
    </div>
  )
}

