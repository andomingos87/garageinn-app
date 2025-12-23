'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Cria um novo usuário no sistema via Edge Function
 * A Edge Function usa a service_role key para criar o convite
 */
export async function createUser(formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const cpf = formData.get('cpf') as string
  const roles = JSON.parse(formData.get('roles') as string || '[]') as string[]

  // Validação básica
  if (!full_name || !email) {
    return { error: 'Nome e email são obrigatórios' }
  }

  // Obter o token do usuário atual para passar para a Edge Function
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    return { error: 'Sessão expirada. Por favor, faça login novamente.' }
  }

  // Chamar a Edge Function com headers customizados
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/invite-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email,
      full_name,
      phone: phone || undefined,
      cpf: cpf || undefined,
      role_ids: roles.length > 0 ? roles : undefined,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Erro ao chamar Edge Function:', data)
    return { error: data.error || 'Erro ao enviar convite' }
  }

  if (data?.error) {
    return { error: data.error }
  }

  revalidatePath('/usuarios')
  return { success: true, userId: data?.user_id, message: data?.message }
}
