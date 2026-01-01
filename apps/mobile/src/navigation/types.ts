/**
 * Gapp Mobile - Navigation Types
 * 
 * Definição de tipos TypeScript para navegação type-safe.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// === Root Stack Navigator ===
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  
  // Main app (tabs)
  Main: NavigatorScreenParams<MainTabParamList>;
  
  // Modal screens
  Notifications: undefined;
  Settings: undefined;
};

// === Main Tab Navigator ===
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Checklists: NavigatorScreenParams<ChecklistsStackParamList>;
  Tickets: NavigatorScreenParams<TicketsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// === Home Stack ===
export type HomeStackParamList = {
  HomeScreen: undefined;
  UnitDetails: { unitId: string };
};

// === Checklists Stack ===
export type ChecklistsStackParamList = {
  ChecklistsList: undefined;
  ChecklistExecution: { checklistId: string; executionId?: string };
  ChecklistDetails: { executionId: string };
};

// === Tickets Stack ===
export type TicketsStackParamList = {
  TicketsList: undefined;
  TicketDetails: { ticketId: string };
  NewTicket: { type?: 'sinistro' | 'manutencao' | 'compras' | 'rh' };
};

// === Profile Stack ===
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

// === Screen Props Types ===
// Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Main Tabs
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Home Stack
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<'Home'>
  >;

// Checklists Stack
export type ChecklistsStackScreenProps<T extends keyof ChecklistsStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<ChecklistsStackParamList, T>,
    MainTabScreenProps<'Checklists'>
  >;

// Tickets Stack
export type TicketsStackScreenProps<T extends keyof TicketsStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<TicketsStackParamList, T>,
    MainTabScreenProps<'Tickets'>
  >;

// Profile Stack
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<'Profile'>
  >;

// === Global Declaration ===
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

