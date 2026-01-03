/**
 * Gapp Mobile - Checklist Service
 * 
 * Serviço para operações de checklist no Supabase.
 */

import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import {
  ChecklistTemplate,
  ChecklistQuestion,
  ChecklistExecution,
  ChecklistExecutionWithDetails,
  ChecklistExecutionAnswer,
  ChecklistTemplateDbResponse,
  ChecklistQuestionDbResponse,
  ChecklistExecutionDbResponse,
  ChecklistError,
} from '../types/checklist.types';

/**
 * Mapeia resposta do DB para tipo do app - Template
 */
function mapDbTemplate(db: ChecklistTemplateDbResponse): ChecklistTemplate {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    type: db.type as 'opening' | 'supervision',
    isDefault: db.is_default,
    status: db.status as 'active' | 'inactive',
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

/**
 * Mapeia resposta do DB para tipo do app - Question
 */
function mapDbQuestion(db: ChecklistQuestionDbResponse): ChecklistQuestion {
  return {
    id: db.id,
    templateId: db.template_id,
    questionText: db.question_text,
    orderIndex: db.order_index,
    isRequired: db.is_required,
    requiresObservationOnNo: db.requires_observation_on_no,
    status: db.status as 'active' | 'inactive',
  };
}

/**
 * Mapeia resposta do DB para tipo do app - Execution
 */
function mapDbExecution(db: ChecklistExecutionDbResponse): ChecklistExecutionWithDetails {
  const execution: ChecklistExecutionWithDetails = {
    id: db.id,
    templateId: db.template_id,
    unitId: db.unit_id,
    executedBy: db.executed_by,
    startedAt: db.started_at,
    completedAt: db.completed_at,
    status: db.status as 'in_progress' | 'completed',
    generalObservations: db.general_observations,
    hasNonConformities: db.has_non_conformities,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };

  if (db.checklist_templates) {
    execution.template = mapDbTemplate(db.checklist_templates);
  }

  if (db.units) {
    execution.unit = {
      id: db.units.id,
      name: db.units.name,
      code: db.units.code,
    };
  }

  if (db.profiles) {
    execution.executor = {
      id: db.profiles.id,
      fullName: db.profiles.full_name,
    };
  }

  if (db.checklist_answers) {
    execution.answers = db.checklist_answers.map(answer => ({
      id: answer.id,
      executionId: db.id,
      questionId: answer.question_id,
      answer: answer.answer,
      observation: answer.observation,
      question: answer.checklist_questions 
        ? mapDbQuestion(answer.checklist_questions) 
        : undefined,
    }));
    execution.nonConformitiesCount = db.checklist_answers.filter(a => !a.answer).length;
  }

  return execution;
}

/**
 * Busca o template de abertura vinculado a uma unidade
 */
export async function fetchOpeningTemplateForUnit(
  unitId: string
): Promise<ChecklistTemplate | null> {
  logger.info('checklistService: Fetching opening template for unit', { unitId });

  try {
    // Primeiro tenta buscar template específico da unidade
    const { data: unitTemplate, error: unitError } = await supabase
      .from('unit_checklist_templates')
      .select(`
        template_id,
        checklist_templates (
          id, name, description, type, is_default, status, created_at, updated_at
        )
      `)
      .eq('unit_id', unitId)
      .single();

    if (unitTemplate?.checklist_templates) {
      const template = unitTemplate.checklist_templates as unknown as ChecklistTemplateDbResponse;
      if (template.type === 'opening' && template.status === 'active') {
        logger.info('checklistService: Found unit-specific template', { templateId: template.id });
        return mapDbTemplate(template);
      }
    }

    // Se não encontrou, busca template padrão de abertura
    const { data: defaultTemplate, error: defaultError } = await supabase
      .from('checklist_templates')
      .select('*')
      .eq('type', 'opening')
      .eq('is_default', true)
      .eq('status', 'active')
      .single();

    if (defaultError && defaultError.code !== 'PGRST116') {
      logger.error('checklistService: Error fetching default template', { error: defaultError });
      throw defaultError;
    }

    if (defaultTemplate) {
      logger.info('checklistService: Using default opening template', { templateId: defaultTemplate.id });
      return mapDbTemplate(defaultTemplate);
    }

    logger.warn('checklistService: No opening template found for unit', { unitId });
    return null;
  } catch (error) {
    logger.error('checklistService: Failed to fetch template', { unitId, error });
    throw {
      code: 'template_not_found',
      message: 'Template de checklist não encontrado para esta unidade.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Busca as perguntas de um template
 */
export async function fetchTemplateQuestions(
  templateId: string
): Promise<ChecklistQuestion[]> {
  logger.info('checklistService: Fetching questions for template', { templateId });

  try {
    const { data, error } = await supabase
      .from('checklist_questions')
      .select('*')
      .eq('template_id', templateId)
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (error) {
      logger.error('checklistService: Error fetching questions', { error });
      throw error;
    }

    if (!data || data.length === 0) {
      logger.warn('checklistService: No questions found', { templateId });
      return [];
    }

    logger.info('checklistService: Questions loaded', { 
      templateId, 
      count: data.length 
    });

    return data.map(mapDbQuestion);
  } catch (error) {
    logger.error('checklistService: Failed to fetch questions', { templateId, error });
    throw {
      code: 'questions_not_found',
      message: 'Erro ao carregar perguntas do checklist.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Cria uma nova execução de checklist
 */
export async function createExecution(
  templateId: string,
  unitId: string,
  executedBy: string
): Promise<ChecklistExecution> {
  logger.info('checklistService: Creating execution', { templateId, unitId, executedBy });

  try {
    const { data, error } = await supabase
      .from('checklist_executions')
      .insert({
        template_id: templateId,
        unit_id: unitId,
        executed_by: executedBy,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('checklistService: Error creating execution', { error });
      throw error;
    }

    logger.info('checklistService: Execution created', { executionId: data.id });

    return {
      id: data.id,
      templateId: data.template_id,
      unitId: data.unit_id,
      executedBy: data.executed_by,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      status: data.status,
      generalObservations: data.general_observations,
      hasNonConformities: data.has_non_conformities,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    logger.error('checklistService: Failed to create execution', { error });
    throw {
      code: 'execution_failed',
      message: 'Erro ao iniciar execução do checklist.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Salva respostas de uma execução
 */
export async function saveAnswers(
  executionId: string,
  answers: Array<{ questionId: string; answer: boolean; observation: string | null }>
): Promise<void> {
  logger.info('checklistService: Saving answers', { 
    executionId, 
    answersCount: answers.length 
  });

  try {
    const { error } = await supabase
      .from('checklist_answers')
      .upsert(
        answers.map(a => ({
          execution_id: executionId,
          question_id: a.questionId,
          answer: a.answer,
          observation: a.observation,
        })),
        { onConflict: 'execution_id,question_id' }
      );

    if (error) {
      logger.error('checklistService: Error saving answers', { error });
      throw error;
    }

    logger.info('checklistService: Answers saved', { executionId });
  } catch (error) {
    logger.error('checklistService: Failed to save answers', { error });
    throw {
      code: 'execution_failed',
      message: 'Erro ao salvar respostas.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Finaliza uma execução de checklist
 */
export async function completeExecution(
  executionId: string,
  generalObservations: string | null,
  hasNonConformities: boolean
): Promise<ChecklistExecution> {
  logger.info('checklistService: Completing execution', { 
    executionId, 
    hasNonConformities 
  });

  try {
    const { data, error } = await supabase
      .from('checklist_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        general_observations: generalObservations,
        has_non_conformities: hasNonConformities,
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId)
      .select()
      .single();

    if (error) {
      logger.error('checklistService: Error completing execution', { error });
      throw error;
    }

    logger.info('checklistService: Execution completed', { executionId });

    return {
      id: data.id,
      templateId: data.template_id,
      unitId: data.unit_id,
      executedBy: data.executed_by,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      status: data.status,
      generalObservations: data.general_observations,
      hasNonConformities: data.has_non_conformities,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    logger.error('checklistService: Failed to complete execution', { error });
    throw {
      code: 'execution_failed',
      message: 'Erro ao finalizar execução.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Busca histórico de execuções do usuário ou por unidade
 */
export async function fetchExecutionHistory(params: {
  userId?: string;
  unitId?: string;
  limit?: number;
  offset?: number;
}): Promise<ChecklistExecutionWithDetails[]> {
  const { userId, unitId, limit = 20, offset = 0 } = params;

  logger.info('checklistService: Fetching execution history', { userId, unitId, limit, offset });

  try {
    let query = supabase
      .from('checklist_executions')
      .select(`
        *,
        checklist_templates (id, name, description, type, is_default, status, created_at, updated_at),
        units (id, name, code),
        profiles (id, full_name),
        checklist_answers (
          id,
          question_id,
          answer,
          observation,
          checklist_questions (
            id, template_id, question_text, order_index, is_required, requires_observation_on_no, status
          )
        )
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('executed_by', userId);
    }

    if (unitId) {
      query = query.eq('unit_id', unitId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('checklistService: Error fetching history', { error });
      throw error;
    }

    logger.info('checklistService: History loaded', { count: data?.length ?? 0 });

    return (data || []).map(item => mapDbExecution(item as ChecklistExecutionDbResponse));
  } catch (error) {
    logger.error('checklistService: Failed to fetch history', { error });
    throw {
      code: 'network_error',
      message: 'Erro ao carregar histórico.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

/**
 * Busca uma execução específica com detalhes
 */
export async function fetchExecutionDetails(
  executionId: string
): Promise<ChecklistExecutionWithDetails | null> {
  logger.info('checklistService: Fetching execution details', { executionId });

  try {
    const { data, error } = await supabase
      .from('checklist_executions')
      .select(`
        *,
        checklist_templates (id, name, description, type, is_default, status, created_at, updated_at),
        units (id, name, code),
        profiles (id, full_name),
        checklist_answers (
          id,
          question_id,
          answer,
          observation,
          checklist_questions (
            id, template_id, question_text, order_index, is_required, requires_observation_on_no, status
          )
        )
      `)
      .eq('id', executionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('checklistService: Error fetching execution', { error });
      throw error;
    }

    logger.info('checklistService: Execution details loaded', { executionId });

    return mapDbExecution(data as ChecklistExecutionDbResponse);
  } catch (error) {
    logger.error('checklistService: Failed to fetch execution', { error });
    throw {
      code: 'network_error',
      message: 'Erro ao carregar detalhes da execução.',
      originalError: error as Error,
    } as ChecklistError;
  }
}

