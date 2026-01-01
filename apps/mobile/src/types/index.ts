/**
 * Gapp Mobile - Shared Types
 */

// Re-export theme types
export type { Theme, ThemeColors, ColorScheme } from '../theme';

// === App State Types ===
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// === Navigation Types ===
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tickets: undefined;
  Checklists: undefined;
  Profile: undefined;
};

// === User Types (placeholder - será sincronizado com backend) ===
export interface User {
  id: string;
  email: string;
  name: string | null;
}

