/**
 * Gapp Mobile - Checklist Types
 * 
 * Tipos TypeScript para o módulo de checklists.
 */

/**
 * Template de checklist
 */
export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  type: 'opening' | 'supervision';
  isDefault: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * Pergunta do checklist
 */
export interface ChecklistQuestion {
  id: string;
  templateId: string;
  questionText: string;
  orderIndex: number;
  isRequired: boolean;
  requiresObservationOnNo: boolean;
  status: 'active' | 'inactive';
}

/**
 * Resposta de uma pergunta
 */
export interface ChecklistAnswer {
  questionId: string;
  answer: boolean | null;
  observation: string;
  photoUri?: string | null;
}

/**
 * Execução do checklist
 */
export interface ChecklistExecution {
  id: string;
  templateId: string;
  unitId: string;
  executedBy: string;
  startedAt: string;
  completedAt: string | null;
  status: 'in_progress' | 'completed';
  generalObservations: string | null;
  hasNonConformities: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Execução com detalhes para exibição
 */
export interface ChecklistExecutionWithDetails extends ChecklistExecution {
  template?: ChecklistTemplate;
  unit?: {
    id: string;
    name: string;
    code: string;
  };
  executor?: {
    id: string;
    fullName: string;
  };
  answers?: ChecklistExecutionAnswer[];
  nonConformitiesCount?: number;
}

/**
 * Resposta salva de uma execução
 */
export interface ChecklistExecutionAnswer {
  id: string;
  executionId: string;
  questionId: string;
  answer: boolean;
  observation: string | null;
  question?: ChecklistQuestion;
}

/**
 * Estado do rascunho de execução (persistido localmente)
 */
export interface ChecklistDraft {
  templateId: string;
  unitId: string;
  answers: Record<string, ChecklistAnswer>;
  generalObservations: string;
  startedAt: string;
  lastUpdatedAt: string;
  photos: ChecklistPhoto[];
}

/**
 * Foto do checklist
 */
export interface ChecklistPhoto {
  id: string;
  questionId?: string; // null = foto geral
  uri: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
  uploadedUrl?: string;
}

/**
 * Resposta do banco - template
 */
export interface ChecklistTemplateDbResponse {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Resposta do banco - pergunta
 */
export interface ChecklistQuestionDbResponse {
  id: string;
  template_id: string;
  question_text: string;
  order_index: number;
  is_required: boolean;
  requires_observation_on_no: boolean;
  status: string;
}

/**
 * Resposta do banco - execução
 */
export interface ChecklistExecutionDbResponse {
  id: string;
  template_id: string;
  unit_id: string;
  executed_by: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  general_observations: string | null;
  has_non_conformities: boolean;
  created_at: string;
  updated_at: string;
  checklist_templates?: ChecklistTemplateDbResponse;
  units?: {
    id: string;
    name: string;
    code: string;
  };
  profiles?: {
    id: string;
    full_name: string;
  };
  checklist_answers?: {
    id: string;
    question_id: string;
    answer: boolean;
    observation: string | null;
    checklist_questions?: ChecklistQuestionDbResponse;
  }[];
}

/**
 * Estado de erro do checklist
 */
export type ChecklistErrorCode =
  | 'template_not_found'
  | 'questions_not_found'
  | 'execution_failed'
  | 'network_error'
  | 'validation_error'
  | 'unknown';

export interface ChecklistError {
  code: ChecklistErrorCode;
  message: string;
  originalError?: Error;
}

export const CHECKLIST_ERROR_MESSAGES: Record<ChecklistErrorCode, string> = {
  template_not_found: 'Template de checklist não encontrado para esta unidade.',
  questions_not_found: 'Nenhuma pergunta encontrada para este checklist.',
  execution_failed: 'Erro ao salvar a execução. Tente novamente.',
  network_error: 'Sem conexão com a internet. Verifique sua conexão.',
  validation_error: 'Preencha todas as perguntas obrigatórias.',
  unknown: 'Ocorreu um erro. Tente novamente.',
};

