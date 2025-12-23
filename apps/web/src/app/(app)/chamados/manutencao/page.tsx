import { Wrench, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ChamadosManutencaoPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Chamados de Manutenção</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie solicitações de manutenção e acompanhe o status
          </p>
        </div>
        <Button asChild>
          <Link href="/chamados/manutencao/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      {/* Placeholder for listing - will be implemented in Task 3 */}
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Listagem em desenvolvimento</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A listagem de chamados de manutenção será implementada na Tarefa 3.
          <br />
          Por enquanto, você pode criar um novo chamado clicando no botão acima.
        </p>
        <Button asChild className="mt-4">
          <Link href="/chamados/manutencao/novo">
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Chamado
          </Link>
        </Button>
      </div>
    </div>
  )
}

