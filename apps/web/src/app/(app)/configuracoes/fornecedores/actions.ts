'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Supplier CRUD Functions
// ============================================

/**
 * Busca todos os fornecedores credenciados
 */
export async function getSuppliers(filters?: {
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'all'
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('accredited_suppliers')
    .select(`
      *,
      creator:profiles!created_by(id, full_name, avatar_url)
    `)
    .order('name', { ascending: true })
  
  // Filtro de status
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('is_active', filters.status === 'active')
  }
  
  // Filtro de categoria
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  // Filtro de busca
  if (filters?.search) {
    const search = `%${filters.search}%`
    query = query.or(`name.ilike.${search},cnpj.ilike.${search},contact_name.ilike.${search}`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
  
  return data || []
}

/**
 * Busca um fornecedor por ID
 */
export async function getSupplierById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accredited_suppliers')
    .select(`
      *,
      creator:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching supplier:', error)
    return null
  }
  
  return data
}

/**
 * Cria um novo fornecedor
 */
export async function createSupplier(data: {
  name: string
  cnpj?: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  category?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Validações
  if (!data.name || data.name.trim().length < 2) {
    return { error: 'Nome do fornecedor é obrigatório' }
  }
  
  // Verificar CNPJ duplicado (se informado)
  if (data.cnpj) {
    const cnpjClean = data.cnpj.replace(/\D/g, '')
    const { data: existing } = await supabase
      .from('accredited_suppliers')
      .select('id')
      .eq('cnpj', cnpjClean)
      .single()
    
    if (existing) {
      return { error: 'Já existe um fornecedor com este CNPJ' }
    }
  }
  
  const { error } = await supabase
    .from('accredited_suppliers')
    .insert({
      name: data.name.trim(),
      cnpj: data.cnpj?.replace(/\D/g, '') || null,
      contact_name: data.contact_name?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      category: data.category || null,
      notes: data.notes?.trim() || null,
      is_active: true,
      created_by: user.id
    })
  
  if (error) {
    console.error('Error creating supplier:', error)
    return { error: error.message }
  }
  
  revalidatePath('/configuracoes/fornecedores')
  return { success: true }
}

/**
 * Atualiza um fornecedor
 */
export async function updateSupplier(
  id: string,
  data: {
    name?: string
    cnpj?: string
    contact_name?: string
    phone?: string
    email?: string
    address?: string
    category?: string
    notes?: string
  }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Validações
  if (data.name !== undefined && data.name.trim().length < 2) {
    return { error: 'Nome do fornecedor é obrigatório' }
  }
  
  // Verificar CNPJ duplicado (se alterado)
  if (data.cnpj) {
    const cnpjClean = data.cnpj.replace(/\D/g, '')
    const { data: existing } = await supabase
      .from('accredited_suppliers')
      .select('id')
      .eq('cnpj', cnpjClean)
      .neq('id', id)
      .single()
    
    if (existing) {
      return { error: 'Já existe outro fornecedor com este CNPJ' }
    }
  }
  
  const updateData: Record<string, unknown> = {}
  
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.cnpj !== undefined) updateData.cnpj = data.cnpj.replace(/\D/g, '') || null
  if (data.contact_name !== undefined) updateData.contact_name = data.contact_name.trim() || null
  if (data.phone !== undefined) updateData.phone = data.phone.trim() || null
  if (data.email !== undefined) updateData.email = data.email.trim() || null
  if (data.address !== undefined) updateData.address = data.address.trim() || null
  if (data.category !== undefined) updateData.category = data.category || null
  if (data.notes !== undefined) updateData.notes = data.notes.trim() || null
  
  const { error } = await supabase
    .from('accredited_suppliers')
    .update(updateData)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating supplier:', error)
    return { error: error.message }
  }
  
  revalidatePath('/configuracoes/fornecedores')
  return { success: true }
}

/**
 * Ativa/Desativa um fornecedor
 */
export async function toggleSupplierStatus(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Buscar status atual
  const { data: supplier } = await supabase
    .from('accredited_suppliers')
    .select('is_active')
    .eq('id', id)
    .single()
  
  if (!supplier) {
    return { error: 'Fornecedor não encontrado' }
  }
  
  const { error } = await supabase
    .from('accredited_suppliers')
    .update({ is_active: !supplier.is_active })
    .eq('id', id)
  
  if (error) {
    console.error('Error toggling supplier status:', error)
    return { error: error.message }
  }
  
  revalidatePath('/configuracoes/fornecedores')
  return { success: true, isActive: !supplier.is_active }
}

/**
 * Exclui um fornecedor
 */
export async function deleteSupplier(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }
  
  // Verificar se há cotações vinculadas
  const { count } = await supabase
    .from('claim_purchase_quotations')
    .select('id', { count: 'exact', head: true })
    .eq('supplier_id', id)
  
  if (count && count > 0) {
    return { error: 'Este fornecedor possui cotações vinculadas e não pode ser excluído. Desative-o em vez disso.' }
  }
  
  const { error } = await supabase
    .from('accredited_suppliers')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting supplier:', error)
    return { error: error.message }
  }
  
  revalidatePath('/configuracoes/fornecedores')
  return { success: true }
}

/**
 * Busca categorias únicas de fornecedores
 */
export async function getSupplierCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('accredited_suppliers')
    .select('category')
    .not('category', 'is', null)
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  // Extrair categorias únicas
  const categories = [...new Set(data?.map(d => d.category).filter(Boolean))]
  return categories.sort()
}

