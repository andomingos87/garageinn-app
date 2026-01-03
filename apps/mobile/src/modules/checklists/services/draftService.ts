/**
 * Gapp Mobile - Checklist Draft Service
 * 
 * Serviço para persistência local de rascunhos de checklist.
 * Permite salvar progresso e reenviar quando houver conexão.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../lib/observability';
import { ChecklistDraft, ChecklistAnswer, ChecklistPhoto } from '../types/checklist.types';

const DRAFT_STORAGE_KEY = '@gapp/checklist_drafts';
const PENDING_UPLOADS_KEY = '@gapp/checklist_pending_uploads';

/**
 * Gera uma chave única para um rascunho
 */
function getDraftKey(templateId: string, unitId: string): string {
  return `${templateId}_${unitId}`;
}

/**
 * Busca todos os rascunhos salvos
 */
export async function getAllDrafts(): Promise<Record<string, ChecklistDraft>> {
  try {
    const data = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    logger.error('draftService: Failed to get drafts', { error });
    return {};
  }
}

/**
 * Busca um rascunho específico
 */
export async function getDraft(
  templateId: string, 
  unitId: string
): Promise<ChecklistDraft | null> {
  try {
    const drafts = await getAllDrafts();
    const key = getDraftKey(templateId, unitId);
    return drafts[key] || null;
  } catch (error) {
    logger.error('draftService: Failed to get draft', { templateId, unitId, error });
    return null;
  }
}

/**
 * Salva ou atualiza um rascunho
 */
export async function saveDraft(draft: ChecklistDraft): Promise<void> {
  try {
    const drafts = await getAllDrafts();
    const key = getDraftKey(draft.templateId, draft.unitId);
    
    drafts[key] = {
      ...draft,
      lastUpdatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    
    logger.info('draftService: Draft saved', { 
      templateId: draft.templateId, 
      unitId: draft.unitId,
      answersCount: Object.keys(draft.answers).length,
    });
  } catch (error) {
    logger.error('draftService: Failed to save draft', { error });
    throw error;
  }
}

/**
 * Remove um rascunho
 */
export async function deleteDraft(
  templateId: string, 
  unitId: string
): Promise<void> {
  try {
    const drafts = await getAllDrafts();
    const key = getDraftKey(templateId, unitId);
    
    delete drafts[key];
    
    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    
    logger.info('draftService: Draft deleted', { templateId, unitId });
  } catch (error) {
    logger.error('draftService: Failed to delete draft', { error });
    throw error;
  }
}

/**
 * Atualiza uma resposta específica no rascunho
 */
export async function updateDraftAnswer(
  templateId: string,
  unitId: string,
  questionId: string,
  answer: ChecklistAnswer
): Promise<void> {
  try {
    const draft = await getDraft(templateId, unitId);
    
    if (!draft) {
      // Cria novo rascunho se não existe
      const newDraft: ChecklistDraft = {
        templateId,
        unitId,
        answers: { [questionId]: answer },
        generalObservations: '',
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        photos: [],
      };
      await saveDraft(newDraft);
      return;
    }

    draft.answers[questionId] = answer;
    await saveDraft(draft);
  } catch (error) {
    logger.error('draftService: Failed to update answer', { 
      templateId, 
      unitId, 
      questionId, 
      error 
    });
    throw error;
  }
}

/**
 * Atualiza as observações gerais do rascunho
 */
export async function updateDraftObservations(
  templateId: string,
  unitId: string,
  observations: string
): Promise<void> {
  try {
    const draft = await getDraft(templateId, unitId);
    
    if (!draft) {
      const newDraft: ChecklistDraft = {
        templateId,
        unitId,
        answers: {},
        generalObservations: observations,
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        photos: [],
      };
      await saveDraft(newDraft);
      return;
    }

    draft.generalObservations = observations;
    await saveDraft(draft);
  } catch (error) {
    logger.error('draftService: Failed to update observations', { error });
    throw error;
  }
}

/**
 * Adiciona uma foto ao rascunho
 */
export async function addPhotoToDraft(
  templateId: string,
  unitId: string,
  photo: ChecklistPhoto
): Promise<void> {
  try {
    const draft = await getDraft(templateId, unitId);
    
    if (!draft) {
      const newDraft: ChecklistDraft = {
        templateId,
        unitId,
        answers: {},
        generalObservations: '',
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        photos: [photo],
      };
      await saveDraft(newDraft);
      return;
    }

    draft.photos = [...draft.photos, photo];
    await saveDraft(draft);
  } catch (error) {
    logger.error('draftService: Failed to add photo', { error });
    throw error;
  }
}

/**
 * Remove uma foto do rascunho
 */
export async function removePhotoFromDraft(
  templateId: string,
  unitId: string,
  photoId: string
): Promise<void> {
  try {
    const draft = await getDraft(templateId, unitId);
    
    if (!draft) return;

    draft.photos = draft.photos.filter(p => p.id !== photoId);
    await saveDraft(draft);
  } catch (error) {
    logger.error('draftService: Failed to remove photo', { error });
    throw error;
  }
}

/**
 * Atualiza status de upload de uma foto
 */
export async function updatePhotoUploadStatus(
  templateId: string,
  unitId: string,
  photoId: string,
  status: ChecklistPhoto['uploadStatus'],
  uploadedUrl?: string
): Promise<void> {
  try {
    const draft = await getDraft(templateId, unitId);
    
    if (!draft) return;

    draft.photos = draft.photos.map(p => 
      p.id === photoId 
        ? { ...p, uploadStatus: status, uploadedUrl } 
        : p
    );
    await saveDraft(draft);
  } catch (error) {
    logger.error('draftService: Failed to update photo status', { error });
    throw error;
  }
}

/**
 * Verifica se há rascunhos pendentes
 */
export async function hasPendingDrafts(): Promise<boolean> {
  const drafts = await getAllDrafts();
  return Object.keys(drafts).length > 0;
}

/**
 * Conta rascunhos pendentes
 */
export async function getPendingDraftsCount(): Promise<number> {
  const drafts = await getAllDrafts();
  return Object.keys(drafts).length;
}

/**
 * Lista rascunhos pendentes com resumo
 */
export async function listPendingDrafts(): Promise<Array<{
  templateId: string;
  unitId: string;
  answersCount: number;
  lastUpdatedAt: string;
}>> {
  const drafts = await getAllDrafts();
  
  return Object.values(drafts).map(draft => ({
    templateId: draft.templateId,
    unitId: draft.unitId,
    answersCount: Object.keys(draft.answers).length,
    lastUpdatedAt: draft.lastUpdatedAt,
  }));
}

