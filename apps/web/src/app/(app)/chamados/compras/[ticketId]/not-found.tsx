'use client'

import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TicketNotFound() {
  return (
    <div className="container mx-auto py-16 flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-muted rounded-full mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Chamado não encontrado</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        O chamado que você está procurando não existe ou você não tem permissão para visualizá-lo.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/chamados/compras" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Listagem
          </Link>
        </Button>
        <Button asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Ir para Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

