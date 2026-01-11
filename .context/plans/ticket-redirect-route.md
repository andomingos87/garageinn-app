---
status: done
generated: 2026-01-11
completed: 2026-01-11
---

# Rota de Redirect Inteligente para Chamados

> Criar a rota `/chamados/[ticketId]` que identifica o departamento do chamado e redireciona para a rota específica correta

## Task Snapshot
- **Primary goal:** Resolver o erro 404 quando um chamado é acessado via rota genérica `/chamados/[ticketId]`
- **Success signal:** Qualquer link para `/chamados/[id]` redireciona automaticamente para a rota correta do departamento
- **Complexidade:** Baixa - apenas uma página de redirect

## Problema

Atualmente, quando um chamado é criado ou acessado via hub, o sistema pode redirecionar para:
```
/chamados/[ticketId]
```

Mas essa rota **não existe**. As rotas de detalhes são específicas por departamento:
- `/chamados/compras/[ticketId]`
- `/chamados/manutencao/[ticketId]`
- `/chamados/rh/[ticketId]`
- `/chamados/sinistros/[ticketId]`

## Solução

Criar uma página em `/chamados/[ticketId]/page.tsx` que:
1. Busca o chamado pelo ID
2. Identifica o departamento
3. Redireciona para a rota específica

## Mapeamento de Departamentos

| Departamento | Rota |
|--------------|------|
| Compras e Manutenção (chamados de compras) | `/chamados/compras/[id]` |
| Compras e Manutenção (chamados de manutenção) | `/chamados/manutencao/[id]` |
| RH | `/chamados/rh/[id]` |
| Sinistros | `/chamados/sinistros/[id]` |

### Lógica de Identificação

Como "Compras e Manutenção" é um único departamento mas tem duas rotas, precisamos identificar o tipo de chamado:
- Se tem `ticket_purchase_details` → `/chamados/compras/[id]`
- Se tem `ticket_maintenance_details` → `/chamados/manutencao/[id]`

## Implementação

### Arquivo: `apps/web/src/app/(app)/chamados/[ticketId]/page.tsx`

```typescript
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ ticketId: string }>
}

export default async function TicketRedirectPage({ params }: PageProps) {
  const { ticketId } = await params
  const supabase = await createClient()
  
  // Buscar o chamado com informações do departamento e tipo
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      id,
      department:departments(name),
      purchase_details:ticket_purchase_details(id),
      maintenance_details:ticket_maintenance_details(id),
      rh_details:ticket_rh_details(id),
      claim_details:ticket_claim_details(id)
    `)
    .eq('id', ticketId)
    .single()
  
  if (error || !ticket) {
    notFound()
  }
  
  // Determinar a rota baseada no tipo de chamado
  const departmentName = ticket.department?.name
  
  // Verificar pelo tipo de detalhe (mais preciso)
  if (ticket.purchase_details && ticket.purchase_details.length > 0) {
    redirect(`/chamados/compras/${ticketId}`)
  }
  
  if (ticket.maintenance_details && ticket.maintenance_details.length > 0) {
    redirect(`/chamados/manutencao/${ticketId}`)
  }
  
  if (ticket.rh_details && ticket.rh_details.length > 0) {
    redirect(`/chamados/rh/${ticketId}`)
  }
  
  if (ticket.claim_details && ticket.claim_details.length > 0) {
    redirect(`/chamados/sinistros/${ticketId}`)
  }
  
  // Fallback pelo nome do departamento
  switch (departmentName) {
    case 'Compras e Manutenção':
      // Default para compras se não tem detalhes específicos
      redirect(`/chamados/compras/${ticketId}`)
    case 'RH':
      redirect(`/chamados/rh/${ticketId}`)
    case 'Sinistros':
      redirect(`/chamados/sinistros/${ticketId}`)
    default:
      // Se não conseguir determinar, vai para compras como fallback
      redirect(`/chamados/compras/${ticketId}`)
  }
}
```

### Arquivo: `apps/web/src/app/(app)/chamados/[ticketId]/not-found.tsx`

```typescript
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TicketNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Chamado não encontrado</h2>
      <p className="text-muted-foreground text-center max-w-md">
        O chamado que você está procurando não existe ou foi removido.
      </p>
      <Button asChild>
        <Link href="/chamados">Voltar para Chamados</Link>
      </Button>
    </div>
  )
}
```

## Passos de Implementação

- [x] Criar pasta `apps/web/src/app/(app)/chamados/[ticketId]/`
- [x] Criar arquivo `page.tsx` com lógica de redirect
- [x] Criar arquivo `not-found.tsx` para chamados inexistentes
- [x] Testar acesso via URL genérica
- [x] Verificar redirect para cada tipo de departamento

## Testes

1. Acessar `/chamados/[id-de-compras]` → deve redirecionar para `/chamados/compras/[id]`
2. Acessar `/chamados/[id-de-manutencao]` → deve redirecionar para `/chamados/manutencao/[id]`
3. Acessar `/chamados/[id-inexistente]` → deve mostrar página 404
4. Criar chamado pelo hub e verificar se redirect funciona

## Rollback

Se necessário reverter, basta deletar a pasta:
```
apps/web/src/app/(app)/chamados/[ticketId]/
```
