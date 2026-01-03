/**
 * Gapp Mobile - Checklists Module
 * 
 * Módulo de checklists de abertura e supervisão.
 */

// Screens
export { ChecklistsListScreen } from './screens/ChecklistsListScreen';
export { ChecklistExecutionScreen } from './screens/ChecklistExecutionScreen';
export { ChecklistDetailsScreen } from './screens/ChecklistDetailsScreen';

// Components
export { 
  UnitSelector, 
  QuestionCard, 
  ChecklistProgress, 
  ChecklistSummary,
  PhotoPicker,
} from './components';

// Hooks
export { useChecklistExecution } from './hooks/useChecklistExecution';
export { useUnitSelection } from './hooks/useUnitSelection';

// Types
export type {
  ChecklistTemplate,
  ChecklistQuestion,
  ChecklistExecution,
  ChecklistExecutionWithDetails,
  ChecklistAnswer,
  ChecklistDraft,
  ChecklistPhoto,
  ChecklistError,
} from './types/checklist.types';

// Services
export * as checklistService from './services/checklistService';
export * as draftService from './services/draftService';
export * as photoService from './services/photoService';
