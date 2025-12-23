'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserWithRoles, UserRoleInfo, UserStatus } from '@/lib/supabase/database.types'

/**
 * Busca o perfil do usuário atual
 */
export async function getCurrentUserProfile(): Promise<UserWithRoles | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      phone,
      cpf,
      avatar_url,
      status,
      created_at,
      updated_at,
      user_roles (
        role:roles (
          id,
          name,
          is_global,
          department:departments (
            id,
            name
          )
        )
      )
    `)
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching profile:', error)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles: UserRoleInfo[] = (profile.user_roles || [])
    .filter((ur: any) => ur.role !== null)
    .map((ur: any) => ({
      role_id: ur.role.id,
      role_name: ur.role.name,
      department_id: ur.role.department?.id ?? null,
      department_name: ur.role.department?.name ?? null,
      is_global: ur.role.is_global ?? false,
    }))

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    cpf: profile.cpf,
    avatar_url: profile.avatar_url,
    status: (profile.status || 'pending') as UserStatus,
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
    roles,
  }
}

/**
 * Atualiza o telefone do usuário atual
 */
export async function updatePhone(phone: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ phone: phone || null })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating phone:', error)
    return { error: error.message }
  }

  revalidatePath('/perfil')
  return { success: true }
}

/**
 * Atualiza o avatar do usuário atual
 * 
 * Nota: Em produção, isso deveria usar Supabase Storage.
 * Por simplicidade, estamos apenas salvando a URL diretamente.
 */
export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl || null })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating avatar:', error)
    return { error: error.message }
  }

  revalidatePath('/perfil')
  return { success: true }
}

/**
 * Upload de avatar para Supabase Storage
 * 
 * Nota: Requer configuração do bucket 'avatars' no Supabase Storage
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const file = formData.get('avatar') as File
  
  if (!file || file.size === 0) {
    return { error: 'Nenhum arquivo selecionado' }
  }

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Tipo de arquivo não suportado. Use JPG, PNG ou WebP.' }
  }

  // Validar tamanho (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return { error: 'Arquivo muito grande. Máximo 2MB.' }
  }

  // Nome do arquivo com timestamp para evitar cache
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

  // Upload para Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { 
      upsert: true,
      cacheControl: '3600',
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    
    // Se o bucket não existe, retornar mensagem amigável
    if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
      return { 
        error: 'O armazenamento de imagens ainda não foi configurado. Entre em contato com o administrador.' 
      }
    }
    
    return { error: uploadError.message }
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Atualizar perfil com nova URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating profile with avatar:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/perfil')
  return { success: true, avatarUrl: publicUrl }
}

