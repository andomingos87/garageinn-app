/**
 * Serviço de Impersonação de Usuários
 * 
 * Permite que administradores entrem na sessão de outros usuários
 * para fins de suporte e debug.
 */

import { createClient } from '@/lib/supabase/client'
import { storeOriginalSession, setImpersonationState } from '@/lib/auth/impersonation'

interface ImpersonateResponse {
  link: string
  targetUser: {
    id: string
    name: string
    email: string
  }
}

interface ImpersonateError {
  error: string
}

/**
 * Impersona um usuário alvo.
 * 
 * @param targetUserId - ID do usuário a ser impersonado
 * @param currentUserId - ID do usuário atual (admin)
 * @returns Dados da impersonação incluindo o magic link
 * @throws Error se a impersonação falhar
 */
export async function impersonateUser(
  targetUserId: string,
  currentUserId: string
): Promise<ImpersonateResponse> {
  const supabase = createClient()

  // Obter sessão atual
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Não autenticado. Por favor, faça login novamente.')
  }

  // Não permitir impersonar a si mesmo
  if (targetUserId === currentUserId) {
    throw new Error('Você não pode personificar a si mesmo.')
  }

  // Chamar a Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('URL do Supabase não configurada.')
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/impersonate-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ targetUserId }),
    }
  )

  if (!response.ok) {
    const errorData: ImpersonateError = await response.json()
    throw new Error(errorData.error || 'Erro ao personificar usuário')
  }

  const data: ImpersonateResponse = await response.json()

  // Salvar sessão original antes de redirecionar
  storeOriginalSession(currentUserId)
  setImpersonationState({
    userId: data.targetUser.id,
    userName: data.targetUser.name,
  })

  return data
}

