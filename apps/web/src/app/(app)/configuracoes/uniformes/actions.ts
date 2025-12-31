'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface Uniform {
  id: string
  name: string
  description: string | null
  size: string | null
  type: string | null
  min_stock: number
  current_stock: number
  created_at: string
  updated_at: string
}

export interface UniformTransaction {
  id: string
  uniform_id: string
  uniform_name: string
  uniform_size: string | null
  user_id: string | null
  user_name: string | null
  unit_id: string | null
  unit_name: string | null
  type: 'entrada' | 'saida' | 'ajuste'
  quantity: number
  ticket_id: string | null
  ticket_number: number | null
  created_at: string
}

export interface UniformStats {
  total: number
  totalInStock: number
  lowStock: number
  outOfStock: number
}

// ============================================
// Uniform Actions
// ============================================

/**
 * Busca todos os uniformes
 */
export async function getUniforms(): Promise<Uniform[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('uniforms')
    .select('*')
    .order('name')
    .order('size')

  if (error) {
    console.error('Error fetching uniforms:', error)
    throw new Error('Erro ao buscar uniformes')
  }

  return data || []
}

/**
 * Busca estatísticas dos uniformes
 */
export async function getUniformStats(): Promise<UniformStats> {
  const uniforms = await getUniforms()

  const stats: UniformStats = {
    total: uniforms.length,
    totalInStock: uniforms.reduce((sum, u) => sum + (u.current_stock || 0), 0),
    lowStock: uniforms.filter(u => u.current_stock <= u.min_stock && u.current_stock > 0).length,
    outOfStock: uniforms.filter(u => u.current_stock === 0).length,
  }

  return stats
}

/**
 * Busca transações de uniformes com filtros
 */
export async function getUniformTransactions(filters?: {
  uniform_id?: string
  type?: string
  limit?: number
}): Promise<UniformTransaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from('uniform_transactions')
    .select(`
      id,
      uniform_id,
      user_id,
      unit_id,
      type,
      quantity,
      ticket_id,
      created_at,
      uniform:uniforms (
        name,
        size
      ),
      user:profiles!user_id (
        full_name
      ),
      unit:units (
        name
      ),
      ticket:tickets (
        ticket_number
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.uniform_id) {
    query = query.eq('uniform_id', filters.uniform_id)
  }

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching uniform transactions:', error)
    throw new Error('Erro ao buscar transações')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((t: any) => ({
    id: t.id,
    uniform_id: t.uniform_id,
    uniform_name: t.uniform?.name || 'Uniforme removido',
    uniform_size: t.uniform?.size,
    user_id: t.user_id,
    user_name: t.user?.full_name || null,
    unit_id: t.unit_id,
    unit_name: t.unit?.name || null,
    type: t.type,
    quantity: t.quantity,
    ticket_id: t.ticket_id,
    ticket_number: t.ticket?.ticket_number || null,
    created_at: t.created_at,
  }))
}

/**
 * Cria um novo uniforme
 */
export async function createUniform(data: {
  name: string
  description?: string
  size?: string
  type?: string
  min_stock?: number
  current_stock?: number
}) {
  const supabase = await createClient()

  const insertData = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    size: data.size?.trim() || null,
    type: data.type?.trim() || null,
    min_stock: data.min_stock || 0,
    current_stock: data.current_stock || 0,
  }

  const { data: uniform, error } = await supabase
    .from('uniforms')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating uniform:', error)
    return { error: error.message }
  }

  // Se houver estoque inicial, criar transação de entrada
  if (insertData.current_stock > 0) {
    await supabase
      .from('uniform_transactions')
      .insert({
        uniform_id: uniform.id,
        type: 'entrada',
        quantity: insertData.current_stock,
      })
  }

  revalidatePath('/configuracoes/uniformes')
  return { success: true, data: uniform }
}

/**
 * Atualiza um uniforme existente
 */
export async function updateUniform(id: string, data: {
  name?: string
  description?: string
  size?: string
  type?: string
  min_stock?: number
}) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (data.name !== undefined) {
    updateData.name = data.name.trim()
  }
  if (data.description !== undefined) {
    updateData.description = data.description.trim() || null
  }
  if (data.size !== undefined) {
    updateData.size = data.size.trim() || null
  }
  if (data.type !== undefined) {
    updateData.type = data.type.trim() || null
  }
  if (data.min_stock !== undefined) {
    updateData.min_stock = data.min_stock
  }

  const { error } = await supabase
    .from('uniforms')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating uniform:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/uniformes')
  return { success: true }
}

/**
 * Exclui um uniforme
 */
export async function deleteUniform(id: string) {
  const supabase = await createClient()

  // Verificar se há transações vinculadas
  const { data: transactions, error: transactionsError } = await supabase
    .from('uniform_transactions')
    .select('id')
    .eq('uniform_id', id)
    .limit(1)

  if (transactionsError) {
    console.error('Error checking transactions:', transactionsError)
    return { error: 'Erro ao verificar transações vinculadas' }
  }

  if (transactions && transactions.length > 0) {
    return { error: 'Não é possível excluir um uniforme com transações. Zere o estoque em vez de excluir.' }
  }

  const { error } = await supabase
    .from('uniforms')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting uniform:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/uniformes')
  return { success: true }
}

/**
 * Ajusta estoque de um uniforme (entrada ou saída manual)
 */
export async function adjustUniformStock(
  uniformId: string,
  quantity: number,
  type: 'entrada' | 'saida' | 'ajuste',
  reason?: string
) {
  const supabase = await createClient()

  // Buscar estoque atual
  const { data: uniform, error: fetchError } = await supabase
    .from('uniforms')
    .select('current_stock, name')
    .eq('id', uniformId)
    .single()

  if (fetchError || !uniform) {
    return { error: 'Uniforme não encontrado' }
  }

  // Calcular novo estoque
  let newStock = uniform.current_stock
  if (type === 'entrada') {
    newStock += quantity
  } else if (type === 'saida') {
    newStock -= quantity
    if (newStock < 0) {
      return { error: `Estoque insuficiente. Disponível: ${uniform.current_stock}` }
    }
  } else {
    // Ajuste direto
    newStock = quantity
  }

  // Atualizar estoque
  const { error: updateError } = await supabase
    .from('uniforms')
    .update({ 
      current_stock: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', uniformId)

  if (updateError) {
    console.error('Error updating stock:', updateError)
    return { error: updateError.message }
  }

  // Registrar transação
  const transactionQuantity = type === 'ajuste' 
    ? quantity - uniform.current_stock 
    : (type === 'entrada' ? quantity : -quantity)

  const { error: transactionError } = await supabase
    .from('uniform_transactions')
    .insert({
      uniform_id: uniformId,
      type,
      quantity: Math.abs(transactionQuantity),
    })

  if (transactionError) {
    console.error('Error creating transaction:', transactionError)
    // Não falha a operação, apenas loga
  }

  revalidatePath('/configuracoes/uniformes')
  return { success: true, newStock }
}

// ============================================
// Auth Check
// ============================================

/**
 * Verifica se o usuário atual é admin ou do RH
 */
export async function canManageUniforms(): Promise<boolean> {
  const supabase = await createClient()

  // Admin pode tudo
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (isAdmin) return true

  // Verificar se é do departamento de RH
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: rhDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'RH')
    .single()

  if (!rhDept) return false

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(department_id, name)
    `)
    .eq('user_id', user.id)

  const RH_MANAGEMENT_ROLES = ['Gerente', 'Supervisor', 'Coordenador', 'Analista']
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasRHRole = userRoles?.some((ur: any) => {
    const role = ur.role
    if (!role) return false
    return role.department_id === rhDept.id && RH_MANAGEMENT_ROLES.includes(role.name)
  })

  return hasRHRole || false
}

