import { Wrench, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Wrench className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Chamado não encontrado</h2>
      <p className="text-muted-foreground mb-6">
        O chamado de manutenção que você está procurando não existe ou você não tem permissão para visualizá-lo.
      </p>
      <Button asChild>
        <Link href="/chamados/manutencao">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Chamados
        </Link>
      </Button>
    </div>
  )
}

