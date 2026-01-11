# Plano: Funcionalidade Temporária para Deletar Chamados de Teste

## Contexto

Necessidade de uma funcionalidade **temporária** para deletar chamados criados durante testes, garantindo que não fiquem dados órfãos no banco de dados.

## Análise do Banco de Dados

### Tabela Principal: `tickets`
A tabela `tickets` possui **17 tabelas relacionadas** que precisam ser consideradas na deleção:

#### Tabelas com CASCADE (deleção automática)
As seguintes tabelas já possuem `ON DELETE CASCADE`, então serão deletadas automaticamente:
1. `ticket_comments` → `tickets.id`
2. `ticket_attachments` → `tickets.id` (também cascade para `ticket_comments.id`)
3. `ticket_history` → `tickets.id`
4. `ticket_approvals` → `tickets.id`
5. `ticket_maintenance_details` → `tickets.id`
6. `ticket_maintenance_executions` → `tickets.id`
7. `ticket_purchase_details` → `tickets.id`
8. `ticket_quotations` → `tickets.id`
9. `ticket_claim_details` → `tickets.id`
10. `ticket_rh_details` → `tickets.id`

#### Tabelas com referência nullable (sem cascade)
1. `uniform_transactions.ticket_id` → nullable, precisa ser setado para NULL ou deletado
2. `ticket_claim_details.related_maintenance_ticket_id` → nullable, auto-referência

#### Tabelas relacionadas indiretamente (via `ticket_claim_details`)
Estas tabelas referenciam `ticket_claim_details`, que já tem CASCADE para `tickets`:
1. `claim_communications` → `ticket_claim_details.id`
2. `claim_purchases` → `ticket_claim_details.id`
3. `claim_purchase_items` → `claim_purchases.id`
4. `claim_purchase_quotations` → `claim_purchases.id`

### Storage (Supabase Storage)
- `ticket_attachments.file_path` armazena o caminho dos arquivos no Supabase Storage
- Arquivos precisam ser deletados do storage **antes** de deletar os registros do banco
- **Nota**: O sistema de anexos ainda não está implementado no código, mas a estrutura existe

---

## Escopo da Implementação

### O que será implementado
1. **Server Action** para deletar um chamado específico por ID
2. **Interface administrativa** temporária para listar e deletar chamados de teste
3. **Função SQL** (stored procedure) para deleção segura com todas as dependências
4. **Logs de auditoria** para rastrear deleções

### Restrições de Segurança
- Apenas usuários com role `admin` ou `desenvolvedor` podem deletar
- Não permitir deleção de chamados em status `closed` ou `resolved` (produção)
- Confirmar deleção com modal de confirmação
- Registrar no `audit_logs` quem deletou e quando

---

## Tarefas

### Fase 1: Backend - Função SQL e Server Action

#### 1.1 Criar Migration: Função para Deletar Chamado
**Arquivo**: Nova migration via MCP Supabase

```sql
-- Migration: create_delete_ticket_function
-- Função para deletar chamado e todas suas dependências de forma segura

CREATE OR REPLACE FUNCTION public.delete_ticket_cascade(
  p_ticket_id UUID,
  p_deleted_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket RECORD;
  v_attachments_paths TEXT[];
  v_result JSONB;
BEGIN
  -- Verificar se o ticket existe
  SELECT * INTO v_ticket FROM public.tickets WHERE id = p_ticket_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Chamado não encontrado'
    );
  END IF;
  
  -- Verificar se o ticket pode ser deletado (não está fechado/resolvido)
  IF v_ticket.status IN ('closed', 'resolved') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Chamados fechados ou resolvidos não podem ser deletados'
    );
  END IF;
  
  -- Coletar paths dos anexos para deletar do storage depois
  SELECT ARRAY_AGG(file_path) INTO v_attachments_paths
  FROM public.ticket_attachments
  WHERE ticket_id = p_ticket_id;
  
  -- Limpar referências nullable em uniform_transactions
  UPDATE public.uniform_transactions
  SET ticket_id = NULL
  WHERE ticket_id = p_ticket_id;
  
  -- Limpar auto-referência em ticket_claim_details
  UPDATE public.ticket_claim_details
  SET related_maintenance_ticket_id = NULL
  WHERE related_maintenance_ticket_id = p_ticket_id;
  
  -- Registrar no audit_logs antes de deletar
  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    old_data,
    metadata,
    user_id
  ) VALUES (
    'ticket',
    p_ticket_id,
    'deleted',
    to_jsonb(v_ticket),
    jsonb_build_object(
      'ticket_number', v_ticket.ticket_number,
      'title', v_ticket.title,
      'status', v_ticket.status,
      'department_id', v_ticket.department_id
    ),
    p_deleted_by
  );
  
  -- Deletar o ticket (CASCADE cuida das tabelas relacionadas)
  DELETE FROM public.tickets WHERE id = p_ticket_id;
  
  -- Retornar resultado com paths dos anexos para deletar do storage
  RETURN jsonb_build_object(
    'success', true,
    'ticket_number', v_ticket.ticket_number,
    'attachment_paths', COALESCE(v_attachments_paths, ARRAY[]::TEXT[])
  );
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.delete_ticket_cascade IS 
  'Deleta um chamado e todas suas dependências de forma segura. Retorna paths de anexos para deletar do storage.';

-- Grant para service_role (usado pelo backend)
GRANT EXECUTE ON FUNCTION public.delete_ticket_cascade TO service_role;
```

#### 1.2 Criar Server Action para Deletar Chamado
**Arquivo**: `apps/web/src/app/(app)/chamados/admin/actions.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface DeleteTicketResult {
  success: boolean
  error?: string
  ticketNumber?: number
  attachmentPaths?: string[]
}

export interface TestTicket {
  id: string
  ticket_number: number
  title: string
  status: string
  department_name: string
  created_at: string
  created_by_name: string
}

// ============================================
// Verificação de Permissão
// ============================================

async function checkAdminPermission(): Promise<{ allowed: boolean; userId?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { allowed: false, error: 'Usuário não autenticado' }
  }
  
  // Verificar se usuário tem role admin ou desenvolvedor
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles(name)
    `)
    .eq('user_id', user.id)
  
  const hasAdminRole = userRoles?.some(ur => 
    ur.role?.name === 'Admin' || ur.role?.name === 'Desenvolvedor'
  )
  
  if (!hasAdminRole) {
    return { allowed: false, error: 'Permissão negada. Apenas Admin ou Desenvolvedor podem deletar chamados.' }
  }
  
  return { allowed: true, userId: user.id }
}

// ============================================
// Query Functions
// ============================================

/**
 * Lista chamados que podem ser deletados (não fechados/resolvidos)
 * Para uso administrativo/testes
 */
export async function getTestTickets(): Promise<TestTicket[]> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    console.error(permission.error)
    return []
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      ticket_number,
      title,
      status,
      created_at,
      department:departments(name),
      created_by_profile:profiles!tickets_created_by_fkey(full_name)
    `)
    .not('status', 'in', '("closed","resolved")')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('Error fetching test tickets:', error)
    return []
  }
  
  return (data || []).map(t => ({
    id: t.id,
    ticket_number: t.ticket_number,
    title: t.title,
    status: t.status,
    department_name: t.department?.name || 'N/A',
    created_at: t.created_at,
    created_by_name: t.created_by_profile?.full_name || 'N/A'
  }))
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Deleta um chamado e todas suas dependências
 * ATENÇÃO: Esta é uma operação destrutiva e irreversível
 */
export async function deleteTicket(ticketId: string): Promise<DeleteTicketResult> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    return { success: false, error: permission.error }
  }
  
  const supabase = await createClient()
  
  // Chamar função SQL que faz a deleção em cascata
  const { data, error } = await supabase.rpc('delete_ticket_cascade', {
    p_ticket_id: ticketId,
    p_deleted_by: permission.userId
  })
  
  if (error) {
    console.error('Error deleting ticket:', error)
    return { success: false, error: error.message }
  }
  
  const result = data as { success: boolean; error?: string; ticket_number?: number; attachment_paths?: string[] }
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  // TODO: Deletar arquivos do storage se houver anexos
  // if (result.attachment_paths?.length) {
  //   await supabase.storage.from('ticket-attachments').remove(result.attachment_paths)
  // }
  
  // Revalidar caches
  revalidatePath('/chamados')
  revalidatePath('/chamados/compras')
  revalidatePath('/chamados/manutencao')
  revalidatePath('/chamados/sinistros')
  revalidatePath('/chamados/rh')
  
  return {
    success: true,
    ticketNumber: result.ticket_number,
    attachmentPaths: result.attachment_paths
  }
}

/**
 * Deleta múltiplos chamados de uma vez
 */
export async function deleteMultipleTickets(ticketIds: string[]): Promise<{
  success: boolean
  deleted: number
  failed: number
  errors: string[]
}> {
  const permission = await checkAdminPermission()
  if (!permission.allowed) {
    return { success: false, deleted: 0, failed: ticketIds.length, errors: [permission.error!] }
  }
  
  let deleted = 0
  let failed = 0
  const errors: string[] = []
  
  for (const ticketId of ticketIds) {
    const result = await deleteTicket(ticketId)
    if (result.success) {
      deleted++
    } else {
      failed++
      errors.push(`Ticket ${ticketId}: ${result.error}`)
    }
  }
  
  return {
    success: failed === 0,
    deleted,
    failed,
    errors
  }
}
```

---

### Fase 2: Frontend - Interface Administrativa

#### 2.1 Criar Página de Administração de Chamados
**Arquivo**: `apps/web/src/app/(app)/chamados/admin/page.tsx`

```tsx
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
          Esta é uma ferramenta de uso administrativo. A deleção de chamados é 
          <strong> permanente e irreversível</strong>. Todos os dados relacionados 
          (comentários, anexos, histórico, aprovações) serão removidos.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Chamados Disponíveis para Deleção</CardTitle>
          <CardDescription>
            Apenas chamados que não estão fechados ou resolvidos podem ser deletados.
            Mostrando os últimos 100 chamados.
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
```

#### 2.2 Criar Componente de Tabela com Deleção
**Arquivo**: `apps/web/src/app/(app)/chamados/admin/components/delete-tickets-table.tsx`

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TestTicket, deleteTicket, deleteMultipleTickets } from '../actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DeleteTicketsTableProps {
  tickets: TestTicket[]
}

const statusLabels: Record<string, string> = {
  awaiting_triage: 'Aguardando Triagem',
  awaiting_approval_encarregado: 'Aguardando Encarregado',
  awaiting_approval_supervisor: 'Aguardando Supervisor',
  awaiting_approval_gerente: 'Aguardando Gerente',
  prioritized: 'Priorizado',
  in_progress: 'Em Andamento',
  quoting: 'Em Cotação',
  approved: 'Aprovado',
  awaiting_return: 'Aguardando Retorno',
  denied: 'Negado',
  cancelled: 'Cancelado',
}

export function DeleteTicketsTable({ tickets }: DeleteTicketsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }
  
  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tickets.map(t => t.id)))
    }
  }
  
  const handleDeleteSingle = async (ticketId: string) => {
    setDeletingId(ticketId)
    startTransition(async () => {
      const result = await deleteTicket(ticketId)
      if (result.success) {
        toast.success(`Chamado #${result.ticketNumber} deletado com sucesso`)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao deletar chamado')
      }
      setDeletingId(null)
    })
  }
  
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      const result = await deleteMultipleTickets(ids)
      if (result.success) {
        toast.success(`${result.deleted} chamado(s) deletado(s) com sucesso`)
      } else {
        toast.warning(`${result.deleted} deletado(s), ${result.failed} falha(s)`)
        result.errors.forEach(err => toast.error(err))
      }
      setSelectedIds(new Set())
      router.refresh()
    })
  }
  
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum chamado disponível para deleção.
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="text-sm">
            {selectedIds.size} chamado(s) selecionado(s)
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Deletar Selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Deleção em Massa</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a deletar <strong>{selectedIds.size} chamado(s)</strong>.
                  Esta ação é permanente e não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Deletar {selectedIds.size} chamado(s)
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === tickets.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-24">#</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(ticket.id)}
                  onCheckedChange={() => toggleSelect(ticket.id)}
                />
              </TableCell>
              <TableCell className="font-mono">#{ticket.ticket_number}</TableCell>
              <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
              <TableCell>{ticket.department_name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {statusLabels[ticket.status] || ticket.status}
                </Badge>
              </TableCell>
              <TableCell>{ticket.created_by_name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(ticket.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending && deletingId === ticket.id}
                    >
                      {isPending && deletingId === ticket.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a deletar o chamado <strong>#{ticket.ticket_number}</strong>: {ticket.title}.
                        <br /><br />
                        Esta ação é <strong>permanente</strong> e removerá todos os dados relacionados
                        (comentários, anexos, histórico, aprovações).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSingle(ticket.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar Chamado
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

#### 2.3 Criar arquivo index para componentes
**Arquivo**: `apps/web/src/app/(app)/chamados/admin/components/index.ts`

```typescript
export { DeleteTicketsTable } from './delete-tickets-table'
```

---

### Fase 3: Navegação e Acesso

#### 3.1 Adicionar Link no Menu (Apenas para Admin)
Adicionar link condicional no sidebar ou menu de configurações para usuários admin.

**Localização sugerida**: Menu de configurações ou dropdown do usuário

```tsx
// Exemplo de como adicionar no menu
{hasAdminRole && (
  <Link href="/chamados/admin">
    <Button variant="ghost" className="text-destructive">
      <Trash2 className="h-4 w-4 mr-2" />
      Deletar Chamados (Admin)
    </Button>
  </Link>
)}
```

---

## Checklist de Implementação

### Backend
- [ ] Criar migration com função `delete_ticket_cascade`
- [ ] Aplicar migration via MCP Supabase
- [ ] Criar arquivo `apps/web/src/app/(app)/chamados/admin/actions.ts`
- [ ] Testar função SQL diretamente no Supabase

### Frontend
- [ ] Criar página `apps/web/src/app/(app)/chamados/admin/page.tsx`
- [ ] Criar componente `delete-tickets-table.tsx`
- [ ] Criar arquivo `index.ts` para exports
- [ ] Testar interface no navegador

### Segurança
- [ ] Verificar RLS policies permitem deleção apenas para admin
- [ ] Testar com usuário não-admin (deve negar)
- [ ] Verificar logs de auditoria após deleção

### Testes
- [ ] Criar chamado de teste
- [ ] Adicionar comentário ao chamado
- [ ] Deletar chamado e verificar se tudo foi removido
- [ ] Verificar audit_logs registrou a deleção

---

## Considerações de Segurança

1. **RLS**: A função usa `SECURITY DEFINER` para bypassar RLS, mas valida permissões no server action
2. **Audit Trail**: Todas as deleções são registradas em `audit_logs`
3. **Soft Delete vs Hard Delete**: Optamos por hard delete pois é para limpeza de dados de teste
4. **Proteção de Produção**: Chamados `closed` ou `resolved` não podem ser deletados

---

## Remoção Futura

Esta funcionalidade é **temporária**. Para remover:

1. Deletar pasta `apps/web/src/app/(app)/chamados/admin/`
2. Remover função SQL via migration:
   ```sql
   DROP FUNCTION IF EXISTS public.delete_ticket_cascade;
   ```
3. Remover link do menu de navegação

---

## Dependências

- Nenhuma nova dependência necessária
- Usa componentes existentes do shadcn/ui
- Usa `date-fns` já instalado no projeto
