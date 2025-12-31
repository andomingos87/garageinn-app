import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertTriangle className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="text-2xl font-semibold">Sinistro não encontrado</h2>
      <p className="text-muted-foreground text-center max-w-md">
        O sinistro que você está procurando não existe ou foi removido.
      </p>
      <Button asChild variant="outline">
        <Link href="/chamados/sinistros">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Sinistros
        </Link>
      </Button>
    </div>
  )
}

