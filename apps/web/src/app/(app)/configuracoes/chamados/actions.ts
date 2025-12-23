'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface TicketCategory {
  id: string
  name: string
  department_id: string
  department_name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  tickets_count: number
}

export interface Department {
  id: string
  name: string
  categories_count: number
}

export interface CategoryStats {
  total: number
  active: number
  inactive: number
  byDepartment: Record<string, number>
}

// ============================================
// Category Actions
// ============================================

/**
 * Busca todas as categorias de chamados com informações do departamento
 */
export async function getCategories(): Promise<TicketCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ticket_categories')
    .select(`
      id,
      name,
      department_id,
      status,
      created_at,
      updated_at,
      department:departments (
        id,
        name
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Erro ao buscar categorias')
  }

  // Buscar contagem de chamados por categoria
  const { data: ticketCounts, error: ticketCountError } = await supabase
    .from('tickets')
    .select('category_id')

  if (ticketCountError) {
    console.error('Error fetching ticket counts:', ticketCountError)
  }

  // Contar chamados por categoria
  const ticketsByCategory: Record<string, number> = {}
  ;(ticketCounts || []).forEach((t: { category_id: string | null }) => {
    if (t.category_id) {
      ticketsByCategory[t.category_id] = (ticketsByCategory[t.category_id] || 0) + 1
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    department_id: cat.department_id,
    department_name: cat.department?.name || 'Sem departamento',
    status: cat.status || 'active',
    created_at: cat.created_at,
    updated_at: cat.updated_at,
    tickets_count: ticketsByCategory[cat.id] || 0,
  }))
}

/**
 * Busca categorias por departamento
 */
export async function getCategoriesByDepartment(departmentId: string): Promise<TicketCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ticket_categories')
    .select(`
      id,
      name,
      department_id,
      status,
      created_at,
      updated_at,
      department:departments (
        id,
        name
      )
    `)
    .eq('department_id', departmentId)
    .order('name')

  if (error) {
    console.error('Error fetching categories by department:', error)
    throw new Error('Erro ao buscar categorias')
  }

  // Buscar contagem de chamados por categoria
  const { data: ticketCounts, error: ticketCountError } = await supabase
    .from('tickets')
    .select('category_id')

  if (ticketCountError) {
    console.error('Error fetching ticket counts:', ticketCountError)
  }

  // Contar chamados por categoria
  const ticketsByCategory: Record<string, number> = {}
  ;(ticketCounts || []).forEach((t: { category_id: string | null }) => {
    if (t.category_id) {
      ticketsByCategory[t.category_id] = (ticketsByCategory[t.category_id] || 0) + 1
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    department_id: cat.department_id,
    department_name: cat.department?.name || 'Sem departamento',
    status: cat.status || 'active',
    created_at: cat.created_at,
    updated_at: cat.updated_at,
    tickets_count: ticketsByCategory[cat.id] || 0,
  }))
}

/**
 * Busca departamentos com contagem de categorias
 */
export async function getDepartmentsWithCategories(): Promise<Department[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('departments')
    .select(`
      id,
      name,
      ticket_categories (id)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching departments:', error)
    throw new Error('Erro ao buscar departamentos')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((dept: any) => ({
    id: dept.id,
    name: dept.name,
    categories_count: dept.ticket_categories?.length || 0,
  }))
}

/**
 * Busca estatísticas das categorias
 */
export async function getCategoryStats(): Promise<CategoryStats> {
  const categories = await getCategories()

  const stats: CategoryStats = {
    total: categories.length,
    active: categories.filter((c) => c.status === 'active').length,
    inactive: categories.filter((c) => c.status === 'inactive').length,
    byDepartment: {},
  }

  categories.forEach((cat) => {
    stats.byDepartment[cat.department_id] = (stats.byDepartment[cat.department_id] || 0) + 1
  })

  return stats
}

/**
 * Cria uma nova categoria
 */
export async function createCategory(data: {
  name: string
  department_id: string
  status?: 'active' | 'inactive'
}) {
  const supabase = await createClient()

  const insertData = {
    name: data.name.trim(),
    department_id: data.department_id,
    status: data.status || 'active',
  }

  const { data: category, error } = await supabase
    .from('ticket_categories')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    if (error.code === '23505') {
      return { error: 'Já existe uma categoria com este nome neste departamento' }
    }
    return { error: error.message }
  }

  revalidatePath('/configuracoes/chamados')
  return { success: true, data: category }
}

/**
 * Atualiza uma categoria existente
 */
export async function updateCategory(id: string, data: {
  name?: string
  department_id?: string
  status?: 'active' | 'inactive'
}) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (data.name !== undefined) {
    updateData.name = data.name.trim()
  }
  if (data.department_id !== undefined) {
    updateData.department_id = data.department_id
  }
  if (data.status !== undefined) {
    updateData.status = data.status
  }

  const { error } = await supabase
    .from('ticket_categories')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    if (error.code === '23505') {
      return { error: 'Já existe uma categoria com este nome neste departamento' }
    }
    return { error: error.message }
  }

  revalidatePath('/configuracoes/chamados')
  return { success: true }
}

/**
 * Alterna o status de uma categoria (ativo/inativo)
 */
export async function toggleCategoryStatus(id: string) {
  const supabase = await createClient()

  // Buscar status atual
  const { data: current, error: fetchError } = await supabase
    .from('ticket_categories')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    console.error('Error fetching category:', fetchError)
    return { error: 'Categoria não encontrada' }
  }

  const newStatus = current.status === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('ticket_categories')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error toggling category status:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/chamados')
  return { success: true, newStatus }
}

/**
 * Exclui uma categoria
 */
export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Verificar se há chamados vinculados
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (ticketsError) {
    console.error('Error checking tickets:', ticketsError)
    return { error: 'Erro ao verificar chamados vinculados' }
  }

  if (tickets && tickets.length > 0) {
    return { error: 'Não é possível excluir uma categoria com chamados vinculados. Desative-a em vez de excluir.' }
  }

  const { error } = await supabase
    .from('ticket_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { error: error.message }
  }

  revalidatePath('/configuracoes/chamados')
  return { success: true }
}

// ============================================
// Auth Check
// ============================================

/**
 * Verifica se o usuário atual é admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data === true
}

