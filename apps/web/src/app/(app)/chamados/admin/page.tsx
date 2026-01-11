import { Suspense } from 'react'
import { Metadata } from 'next'
import { getTestTickets } from './actions'
import { DeleteTicketsTable } from './components/delete-tickets-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Admin - Deletar Chamados | GarageInn',
  description: 'Ferramenta administrativa para deletar chamados de teste',
}

export default async function AdminTicketsPage() {
  const tickets = await getTestTickets()
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administração de Chamados</h1>
        <p className="text-muted-foreground">
          Ferramenta temporária para deletar chamados de teste
        </p>
      </div>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção!</AlertTitle>
        <AlertDescription>
          Esta é uma ferramenta de uso administrativo. A deleção de chamados é{' '}
          <strong>permanente e irreversível</strong>. Todos os dados relacionados 
          (comentários, anexos, histórico, aprovações) serão removidos.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Chamados Disponíveis para Deleção</CardTitle>
          <CardDescription>
            Todos os chamados podem ser deletados. Mostrando os últimos 100 chamados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Carregando...</div>}>
            <DeleteTicketsTable tickets={tickets} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
