'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================
// Types
// ============================================

export interface AvailableChecklist {
  unit: {
    id: string
    name: string
    code: string
  }
  template: {
    id: string
    name: string
    type: string
    questions_count: number
  }
  todayExecution: {
    id: string
    status: string
    completed_at: string | null
  } | null
}

export interface ExecutionWithDetails {
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
  questions: Array<{
    id: string
    question_text: string
    order_index: number
    is_required: boolean | null
    requires_observation_on_no: boolean | null
    status: string
  }>
  answers: Array<{
    id: string
    question_id: string
    answer: boolean
    observation: string | null
  }>
}

// ============================================
// Query Functions
// ============================================

/**
 * Obtém os checklists disponíveis para o usuário executar
 * baseado nas unidades vinculadas
 */
export async function getAvailableChecklists(): Promise<AvailableChecklist[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Buscar unidades do usuário
  const { data: userUnits, error: unitsError } = await supabase
    .from('user_units')
    .select(`
      unit:units!inner(
        id,
        name,
        code,
        status
      )
    `)
    .eq('user_id', user.id)

  if (unitsError) {
    console.error('Error fetching user units:', unitsError)
    throw new Error('Erro ao buscar unidades do usuário')
  }

  if (!userUnits || userUnits.length === 0) {
    return []
  }

  // Filtrar unidades ativas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeUnits = userUnits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((uu: any) => uu.unit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((unit: any) => unit && unit.status === 'active')

  if (activeUnits.length === 0) {
    return []
  }

  const result: AvailableChecklist[] = []
  const today = new Date().toISOString().split('T')[0]

  // Para cada unidade, buscar templates de abertura vinculados
  for (const unit of activeUnits) {
    // Buscar templates vinculados
    const { data: unitTemplates } = await supabase
      .from('unit_checklist_templates')
      .select(`
        template:checklist_templates!inner(
          id,
          name,
          type,
          status
        )
      `)
      .eq('unit_id', unit.id)

    if (!unitTemplates || unitTemplates.length === 0) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openingTemplates = unitTemplates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((ut: any) => ut.template)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((t: any) => t && t.status === 'active' && t.type === 'opening')

    for (const template of openingTemplates) {
      // Contar perguntas ativas
      const { count: questionsCount } = await supabase
        .from('checklist_questions')
        .select('id', { count: 'exact', head: true })
        .eq('template_id', template.id)
        .eq('status', 'active')

      // Verificar execução de hoje
      const { data: todayExec } = await supabase
        .from('checklist_executions')
        .select('id, status, completed_at')
        .eq('unit_id', unit.id)
        .eq('template_id', template.id)
        .gte('started_at', `${today}T00:00:00`)
        .lt('started_at', `${today}T23:59:59`)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      result.push({
        unit: {
          id: unit.id,
          name: unit.name,
          code: unit.code,
        },
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          questions_count: questionsCount || 0,
        },
        todayExecution: todayExec ? {
          id: todayExec.id,
          status: todayExec.status,
          completed_at: todayExec.completed_at,
        } : null,
      })
    }
  }

  return result
}

/**
 * Obtém os detalhes de uma execução
 */
export async function getExecution(executionId: string): Promise<ExecutionWithDetails | null> {
  const supabase = await createClient()

  const { data: execution, error } = await supabase
    .from('checklist_executions')
    .select(`
      *,
      template:checklist_templates(
        id,
        name,
        type
      ),
      unit:units(
        id,
        name,
        code
      )
    `)
    .eq('id', executionId)
    .single()

  if (error) {
    console.error('Error fetching execution:', error)
    return null
  }

  // Buscar perguntas ativas do template
  const { data: questions } = await supabase
    .from('checklist_questions')
    .select('*')
    .eq('template_id', execution.template_id)
    .eq('status', 'active')
    .order('order_index')

  // Buscar respostas da execução
  const { data: answers } = await supabase
    .from('checklist_answers')
    .select('*')
    .eq('execution_id', executionId)

  return {
    ...execution,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template: execution.template as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unit: execution.unit as any,
    questions: questions || [],
    answers: answers || [],
  }
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Inicia uma nova execução de checklist
 */
export async function startExecution(unitId: string, templateId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Verificar se o usuário tem acesso à unidade
  const { data: hasAccess } = await supabase
    .from('user_units')
    .select('id')
    .eq('user_id', user.id)
    .eq('unit_id', unitId)
    .maybeSingle()

  if (!hasAccess) {
    return { error: 'Você não tem acesso a esta unidade' }
  }

  // Verificar se já existe execução em andamento hoje
  const today = new Date().toISOString().split('T')[0]
  const { data: existingExecution } = await supabase
    .from('checklist_executions')
    .select('id, status')
    .eq('unit_id', unitId)
    .eq('template_id', templateId)
    .gte('started_at', `${today}T00:00:00`)
    .lt('started_at', `${today}T23:59:59`)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingExecution) {
    if (existingExecution.status === 'in_progress') {
      // Retomar execução existente
      redirect(`/checklists/executar/${existingExecution.id}`)
    }
    // Se já completou hoje, redirecionar para a lista
    return { error: 'Este checklist já foi executado hoje para esta unidade' }
  }

  // Criar nova execução
  const { data, error } = await supabase
    .from('checklist_executions')
    .insert({
      template_id: templateId,
      unit_id: unitId,
      executed_by: user.id,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating execution:', error)
    return { error: error.message }
  }

  revalidatePath('/checklists')
  revalidatePath('/checklists/executar')
  redirect(`/checklists/executar/${data.id}`)
}

/**
 * Salva a resposta de uma pergunta
 */
export async function saveAnswer(
  executionId: string,
  questionId: string,
  answer: boolean,
  observation?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Verificar se a execução pertence ao usuário e está em andamento
  const { data: execution } = await supabase
    .from('checklist_executions')
    .select('id, executed_by, status')
    .eq('id', executionId)
    .single()

  if (!execution) {
    return { error: 'Execução não encontrada' }
  }

  if (execution.executed_by !== user.id) {
    return { error: 'Você não pode editar esta execução' }
  }

  if (execution.status !== 'in_progress') {
    return { error: 'Esta execução já foi finalizada' }
  }

  // Upsert da resposta
  const { error } = await supabase
    .from('checklist_answers')
    .upsert(
      {
        execution_id: executionId,
        question_id: questionId,
        answer,
        observation: observation || null,
      },
      {
        onConflict: 'execution_id,question_id',
      }
    )

  if (error) {
    console.error('Error saving answer:', error)
    return { error: error.message }
  }

  revalidatePath(`/checklists/executar/${executionId}`)
  return { success: true }
}

/**
 * Finaliza uma execução de checklist
 */
export async function completeExecution(executionId: string, generalObservations?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Buscar execução com perguntas e respostas
  const { data: execution, error: execError } = await supabase
    .from('checklist_executions')
    .select('id, executed_by, status, template_id')
    .eq('id', executionId)
    .single()

  if (execError || !execution) {
    return { error: 'Execução não encontrada' }
  }

  if (execution.executed_by !== user.id) {
    return { error: 'Você não pode finalizar esta execução' }
  }

  if (execution.status !== 'in_progress') {
    return { error: 'Esta execução já foi finalizada' }
  }

  // Buscar perguntas obrigatórias
  const { data: questions } = await supabase
    .from('checklist_questions')
    .select('id, is_required, requires_observation_on_no')
    .eq('template_id', execution.template_id)
    .eq('status', 'active')

  // Buscar respostas
  const { data: answers } = await supabase
    .from('checklist_answers')
    .select('question_id, answer, observation')
    .eq('execution_id', executionId)

  // Validar respostas
  const requiredQuestions = questions?.filter(q => q.is_required) || []
  const answersMap = new Map(answers?.map(a => [a.question_id, a]) || [])

  for (const q of requiredQuestions) {
    const ans = answersMap.get(q.id)
    if (!ans) {
      return { error: 'Responda todas as perguntas obrigatórias' }
    }

    if (q.requires_observation_on_no && ans.answer === false && !ans.observation) {
      return { error: 'Adicione observação para as respostas "Não" que exigem justificativa' }
    }
  }

  // Calcular has_non_conformities
  const hasNonConformities = answers?.some(a => a.answer === false) || false

  // Atualizar execução
  const { error } = await supabase
    .from('checklist_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      general_observations: generalObservations || null,
      has_non_conformities: hasNonConformities,
    })
    .eq('id', executionId)

  if (error) {
    console.error('Error completing execution:', error)
    return { error: error.message }
  }

  revalidatePath('/checklists')
  revalidatePath('/checklists/executar')
  redirect('/checklists')
}

