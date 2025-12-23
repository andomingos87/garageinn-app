'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Types
// ============================================

export interface ExecutionsFilters {
  unitId?: string
  templateId?: string
  startDate?: string
  endDate?: string
  status?: 'all' | 'in_progress' | 'completed'
  hasNonConformities?: boolean
  page?: number
  limit?: number
}

export interface ExecutionWithDetails {
  id: string
  started_at: string
  completed_at: string | null
  status: string
  has_non_conformities: boolean | null
  general_observations: string | null
  unit_id: string | null
  unit_name: string | null
  unit_code: string | null
  template_id: string | null
  template_name: string | null
  template_type: string | null
  executed_by: string | null
  executed_by_name: string | null
  executed_by_email: string | null
  executed_by_avatar: string | null
  non_conformities_count: number | null
  total_answers: number | null
  total_questions: number | null
}

export interface ExecutionsResult {
  data: ExecutionWithDetails[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface ExecutionsStats {
  total: number
  completed: number
  inProgress: number
  withNonConformities: number
  conformityRate: string
}

export interface ExecutionDetailsWithAnswers {
  id: string
  template_id: string
  unit_id: string
  executed_by: string
  started_at: string
  completed_at: string | null
  status: string
  general_observations: string | null
  has_non_conformities: boolean | null
  template: {
    id: string
    name: string
    type: string
  }
  unit: {
    id: string
    name: string
    code: string
  }
  executed_by_profile: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
  answers: Array<{
    id: string
    answer: boolean
    observation: string | null
    question: {
      id: string
      question_text: string
      order_index: number
      is_required: boolean | null
      requires_observation_on_no: boolean | null
    }
  }>
}

// ============================================
// Query Functions
// ============================================

/**
 * Lista execuções com filtros e paginação
 */
export async function getExecutions(filters?: ExecutionsFilters): Promise<ExecutionsResult> {
  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('checklist_executions_with_details')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })

  if (filters?.unitId && filters.unitId !== 'all') {
    query = query.eq('unit_id', filters.unitId)
  }

  if (filters?.templateId && filters.templateId !== 'all') {
    query = query.eq('template_id', filters.templateId)
  }

  if (filters?.startDate) {
    query = query.gte('started_at', `${filters.startDate}T00:00:00`)
  }

  if (filters?.endDate) {
    query = query.lte('started_at', `${filters.endDate}T23:59:59`)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.hasNonConformities === true) {
    query = query.eq('has_non_conformities', true)
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching executions:', error)
    throw new Error('Erro ao buscar execuções')
  }

  return {
    data: (data || []) as ExecutionWithDetails[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Obtém estatísticas de execuções com filtros opcionais
 */
export async function getExecutionsStats(filters?: {
  unitId?: string
  startDate?: string
  endDate?: string
}): Promise<ExecutionsStats> {
  const supabase = await createClient()

  let query = supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities')

  if (filters?.unitId && filters.unitId !== 'all') {
    query = query.eq('unit_id', filters.unitId)
  }

  if (filters?.startDate) {
    query = query.gte('started_at', `${filters.startDate}T00:00:00`)
  }

  if (filters?.endDate) {
    query = query.lte('started_at', `${filters.endDate}T23:59:59`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching execution stats:', error)
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      withNonConformities: 0,
      conformityRate: '0',
    }
  }

  const total = data?.length || 0
  const completed = data?.filter(e => e.status === 'completed').length || 0
  const inProgress = data?.filter(e => e.status === 'in_progress').length || 0
  const withNonConformities = data?.filter(e => e.has_non_conformities).length || 0

  return {
    total,
    completed,
    inProgress,
    withNonConformities,
    conformityRate: completed > 0
      ? ((completed - withNonConformities) / completed * 100).toFixed(1)
      : '0',
  }
}

/**
 * Obtém detalhes de uma execução específica
 */
export async function getExecutionDetails(executionId: string): Promise<ExecutionDetailsWithAnswers | null> {
  const supabase = await createClient()

  const { data: execution, error } = await supabase
    .from('checklist_executions')
    .select(`
      *,
      template:checklist_templates(id, name, type),
      unit:units(id, name, code),
      executed_by_profile:profiles!executed_by(id, full_name, email, avatar_url)
    `)
    .eq('id', executionId)
    .single()

  if (error) {
    console.error('Error fetching execution details:', error)
    return null
  }

  // Buscar respostas com perguntas
  const { data: answers, error: answersError } = await supabase
    .from('checklist_answers')
    .select(`
      id,
      answer,
      observation,
      question:checklist_questions(
        id,
        question_text,
        order_index,
        is_required,
        requires_observation_on_no
      )
    `)
    .eq('execution_id', executionId)
    .order('question(order_index)')

  if (answersError) {
    console.error('Error fetching answers:', answersError)
  }

  return {
    ...execution,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template: execution.template as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unit: execution.unit as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executed_by_profile: execution.executed_by_profile as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answers: (answers || []).map((a: any) => ({
      id: a.id,
      answer: a.answer,
      observation: a.observation,
      question: a.question,
    })).sort((a, b) => (a.question?.order_index || 0) - (b.question?.order_index || 0)),
  }
}

/**
 * Lista unidades disponíveis para filtro
 */
export async function getUnitsForFilter() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Error fetching units for filter:', error)
    return []
  }

  return data || []
}

/**
 * Lista templates disponíveis para filtro
 */
export async function getTemplatesForFilter() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('checklist_templates')
    .select('id, name, type')
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Error fetching templates for filter:', error)
    return []
  }

  return data || []
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Exclui uma execução (apenas admin)
 */
export async function deleteExecution(executionId: string) {
  const supabase = await createClient()

  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { error: 'Acesso negado. Apenas administradores podem excluir execuções.' }
  }

  const { error } = await supabase
    .from('checklist_executions')
    .delete()
    .eq('id', executionId)

  if (error) {
    console.error('Error deleting execution:', error)
    return { error: error.message }
  }

  revalidatePath('/checklists')
  return { success: true }
}

/**
 * Exclui múltiplas execuções (apenas admin)
 */
export async function deleteExecutions(executionIds: string[]) {
  const supabase = await createClient()

  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { error: 'Acesso negado. Apenas administradores podem excluir execuções.' }
  }

  const { error } = await supabase
    .from('checklist_executions')
    .delete()
    .in('id', executionIds)

  if (error) {
    console.error('Error deleting executions:', error)
    return { error: error.message }
  }

  revalidatePath('/checklists')
  return { success: true, deletedCount: executionIds.length }
}

// ============================================
// Admin Check
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

