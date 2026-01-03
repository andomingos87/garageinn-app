/**
 * Gapp Mobile - useChecklistExecution Hook
 * 
 * Hook para gerenciar o estado de execução de um checklist.
 * Inclui carregamento de template, perguntas, respostas e persistência de rascunho.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../../../lib/observability';
import { useUserProfileContext } from '../../user/context/UserProfileContext';
import * as checklistService from '../services/checklistService';
import * as draftService from '../services/draftService';
import {
  ChecklistTemplate,
  ChecklistQuestion,
  ChecklistExecution,
  ChecklistAnswer,
  ChecklistDraft,
  ChecklistPhoto,
  ChecklistError,
} from '../types/checklist.types';

interface UseChecklistExecutionState {
  // Estados de carregamento
  loading: boolean;
  loadingQuestions: boolean;
  submitting: boolean;
  error: ChecklistError | null;
  
  // Dados do template
  template: ChecklistTemplate | null;
  questions: ChecklistQuestion[];
  
  // Dados da execução
  execution: ChecklistExecution | null;
  answers: Record<string, ChecklistAnswer>;
  generalObservations: string;
  photos: ChecklistPhoto[];
  
  // Estados auxiliares
  hasDraft: boolean;
  currentQuestionIndex: number;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

interface UseChecklistExecutionActions {
  // Carregamento
  loadTemplate: () => Promise<void>;
  loadDraft: () => Promise<void>;
  
  // Respostas
  setAnswer: (questionId: string, answer: boolean | null, observation?: string) => void;
  setObservation: (questionId: string, observation: string) => void;
  setGeneralObservations: (observations: string) => void;
  
  // Navegação
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  
  // Fotos
  addPhoto: (photo: ChecklistPhoto) => void;
  removePhoto: (photoId: string) => void;
  
  // Persistência
  saveDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  
  // Submissão
  validate: () => boolean;
  submit: () => Promise<ChecklistExecution | null>;
  
  // Reset
  reset: () => void;
}

export type UseChecklistExecutionReturn = UseChecklistExecutionState & UseChecklistExecutionActions;

export function useChecklistExecution(unitId: string): UseChecklistExecutionReturn {
  const { profile } = useUserProfileContext();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ChecklistError | null>(null);
  
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [execution, setExecution] = useState<ChecklistExecution | null>(null);
  
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({});
  const [generalObservations, setGeneralObservationsState] = useState('');
  const [photos, setPhotos] = useState<ChecklistPhoto[]>([]);
  
  const [hasDraft, setHasDraft] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Ref para auto-save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega template de abertura para a unidade
  const loadTemplate = useCallback(async () => {
    if (!unitId) {
      setLoading(false);
      return;
    }

    logger.info('useChecklistExecution: Loading template', { unitId });
    setLoading(true);
    setError(null);

    try {
      const templateData = await checklistService.fetchOpeningTemplateForUnit(unitId);
      
      if (!templateData) {
        setError({
          code: 'template_not_found',
          message: 'Nenhum template de checklist encontrado para esta unidade.',
        });
        setLoading(false);
        return;
      }

      setTemplate(templateData);
      
      // Carrega perguntas
      setLoadingQuestions(true);
      const questionsData = await checklistService.fetchTemplateQuestions(templateData.id);
      setQuestions(questionsData);
      setLoadingQuestions(false);
      
      logger.info('useChecklistExecution: Template loaded', { 
        templateId: templateData.id,
        questionsCount: questionsData.length,
      });
    } catch (err) {
      logger.error('useChecklistExecution: Failed to load template', { error: err });
      setError(err as ChecklistError);
    } finally {
      setLoading(false);
      setLoadingQuestions(false);
    }
  }, [unitId]);

  // Carrega rascunho existente
  const loadDraft = useCallback(async () => {
    if (!template) return;

    logger.info('useChecklistExecution: Loading draft', { templateId: template.id, unitId });

    try {
      const draft = await draftService.getDraft(template.id, unitId);
      
      if (draft) {
        setAnswers(draft.answers);
        setGeneralObservationsState(draft.generalObservations);
        setPhotos(draft.photos);
        setHasDraft(true);
        
        logger.info('useChecklistExecution: Draft loaded', { 
          answersCount: Object.keys(draft.answers).length,
        });
      }
    } catch (err) {
      logger.error('useChecklistExecution: Failed to load draft', { error: err });
    }
  }, [template, unitId]);

  // Auto-save após mudanças
  const autoSave = useCallback(async () => {
    if (!template) return;

    const draft: ChecklistDraft = {
      templateId: template.id,
      unitId,
      answers,
      generalObservations,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      photos,
    };

    try {
      await draftService.saveDraft(draft);
      setHasDraft(true);
    } catch (err) {
      logger.error('useChecklistExecution: Auto-save failed', { error: err });
    }
  }, [template, unitId, answers, generalObservations, photos]);

  // Debounce auto-save
  useEffect(() => {
    if (!template) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, generalObservations, photos, autoSave, template]);

  // Define uma resposta
  const setAnswer = useCallback((
    questionId: string, 
    answer: boolean | null, 
    observation?: string
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        observation: observation ?? prev[questionId]?.observation ?? '',
      },
    }));

    // Limpa erro de validação para esta pergunta
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  }, []);

  // Define observação
  const setObservation = useCallback((questionId: string, observation: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer: prev[questionId]?.answer ?? null,
        observation,
      },
    }));

    // Limpa erro de validação
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  }, []);

  // Define observações gerais
  const setGeneralObservations = useCallback((observations: string) => {
    setGeneralObservationsState(observations);
  }, []);

  // Navegação entre perguntas
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Adicionar foto
  const addPhoto = useCallback((photo: ChecklistPhoto) => {
    setPhotos(prev => [...prev, photo]);
  }, []);

  // Remover foto
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  // Salvar rascunho manualmente
  const saveDraft = useCallback(async () => {
    await autoSave();
  }, [autoSave]);

  // Descartar rascunho
  const discardDraft = useCallback(async () => {
    if (!template) return;

    try {
      await draftService.deleteDraft(template.id, unitId);
      setAnswers({});
      setGeneralObservationsState('');
      setPhotos([]);
      setHasDraft(false);
      setCurrentQuestionIndex(0);
      setValidationErrors({});
      
      logger.info('useChecklistExecution: Draft discarded');
    } catch (err) {
      logger.error('useChecklistExecution: Failed to discard draft', { error: err });
    }
  }, [template, unitId]);

  // Validação
  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const question of questions) {
      const answer = answers[question.id];

      // Verifica se pergunta obrigatória foi respondida
      if (question.isRequired && (answer?.answer === null || answer?.answer === undefined)) {
        errors[question.id] = 'Esta pergunta é obrigatória';
        isValid = false;
        continue;
      }

      // Verifica se observação é obrigatória quando resposta é "Não"
      if (
        question.requiresObservationOnNo && 
        answer?.answer === false && 
        (!answer?.observation || answer.observation.trim() === '')
      ) {
        errors[question.id] = 'Observação obrigatória para resposta "Não"';
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  }, [questions, answers]);

  // Submeter execução
  const submit = useCallback(async (): Promise<ChecklistExecution | null> => {
    if (!template || !profile) {
      setError({
        code: 'validation_error',
        message: 'Dados incompletos para submissão.',
      });
      return null;
    }

    // Valida antes de submeter
    if (!validate()) {
      setError({
        code: 'validation_error',
        message: 'Preencha todas as perguntas obrigatórias.',
      });
      return null;
    }

    logger.info('useChecklistExecution: Submitting execution', { 
      templateId: template.id,
      unitId,
    });

    setSubmitting(true);
    setError(null);

    try {
      // Cria execução
      const exec = await checklistService.createExecution(
        template.id,
        unitId,
        profile.id
      );

      // Salva respostas
      const answersToSave = Object.values(answers)
        .filter(a => a.answer !== null && a.answer !== undefined)
        .map(a => ({
          questionId: a.questionId,
          answer: a.answer as boolean,
          observation: a.observation || null,
        }));

      await checklistService.saveAnswers(exec.id, answersToSave);

      // Verifica não-conformidades
      const hasNonConformities = answersToSave.some(a => a.answer === false);

      // Finaliza execução
      const completedExec = await checklistService.completeExecution(
        exec.id,
        generalObservations || null,
        hasNonConformities
      );

      // Remove rascunho
      await draftService.deleteDraft(template.id, unitId);
      setHasDraft(false);

      setExecution(completedExec);
      
      logger.info('useChecklistExecution: Execution completed', { 
        executionId: completedExec.id,
        hasNonConformities,
      });

      return completedExec;
    } catch (err) {
      logger.error('useChecklistExecution: Submission failed', { error: err });
      setError(err as ChecklistError);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [template, profile, unitId, answers, generalObservations, validate]);

  // Reset
  const reset = useCallback(() => {
    setLoading(true);
    setError(null);
    setTemplate(null);
    setQuestions([]);
    setExecution(null);
    setAnswers({});
    setGeneralObservationsState('');
    setPhotos([]);
    setHasDraft(false);
    setCurrentQuestionIndex(0);
    setValidationErrors({});
  }, []);

  // Calcula se é válido para submissão
  const isValid = questions.length > 0 && 
    questions.every(q => {
      if (!q.isRequired) return true;
      const answer = answers[q.id];
      if (answer?.answer === null || answer?.answer === undefined) return false;
      if (q.requiresObservationOnNo && answer.answer === false) {
        return !!answer.observation?.trim();
      }
      return true;
    });

  return {
    // Estados
    loading,
    loadingQuestions,
    submitting,
    error,
    template,
    questions,
    execution,
    answers,
    generalObservations,
    photos,
    hasDraft,
    currentQuestionIndex,
    isValid,
    validationErrors,
    
    // Actions
    loadTemplate,
    loadDraft,
    setAnswer,
    setObservation,
    setGeneralObservations,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    addPhoto,
    removePhoto,
    saveDraft,
    discardDraft,
    validate,
    submit,
    reset,
  };
}

