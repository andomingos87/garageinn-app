/**
 * Gapp Mobile - Permissions Types
 * 
 * Tipos TypeScript para o sistema de permissões (RBAC).
 * Define permissões de alto nível para gating de UI.
 * 
 * IMPORTANTE: As permissões no mobile são apenas para UX (gating de UI).
 * A segurança real é garantida pelo RLS no Supabase.
 */

import { UserProfile } from './userProfile.types';

/**
 * Permissões de recursos/features do app
 */
export type Permission =
  // Checklists
  | 'checklist:execute_opening'      // Executar checklist de abertura
  | 'checklist:execute_supervision'  // Executar checklist de supervisão
  | 'checklist:view_history'         // Ver histórico de checklists
  | 'checklist:view_all_units'       // Ver checklists de todas unidades
  
  // Tickets/Chamados
  | 'ticket:create'                  // Criar chamado
  | 'ticket:view_own'                // Ver próprios chamados
  | 'ticket:view_unit'               // Ver chamados da unidade
  | 'ticket:view_all'                // Ver todos chamados (scope)
  | 'ticket:comment'                 // Comentar em chamados
  | 'ticket:close_own'               // Fechar próprios chamados
  | 'ticket:triage'                  // Fazer triagem de chamados
  | 'ticket:assign'                  // Atribuir chamados
  
  // Unidades
  | 'unit:select'                    // Selecionar unidade (supervisor+)
  | 'unit:view_all'                  // Ver todas unidades
  
  // Admin
  | 'admin:users'                    // Gerenciar usuários
  | 'admin:settings'                 // Gerenciar configurações
  | 'admin:reports';                 // Visualizar relatórios

/**
 * Mapeamento de roles para permissões
 * Define quais permissões cada tipo de role possui
 */
export type RolePermissionMap = {
  [roleName: string]: Permission[];
};

/**
 * Configuração de permissões por contexto
 */
export interface PermissionContext {
  /**
   * Se o usuário está agindo em uma unidade específica
   */
  unitId?: string;
  
  /**
   * Se está verificando permissão sobre recurso próprio (ex: próprio chamado)
   */
  isOwner?: boolean;
  
  /**
   * Dados adicionais para verificação contextual
   */
  metadata?: Record<string, unknown>;
}

/**
 * Resultado da verificação de permissão
 */
export interface PermissionCheckResult {
  /**
   * Se a permissão foi concedida
   */
  granted: boolean;
  
  /**
   * Motivo da negação (se aplicável)
   */
  reason?: string;
  
  /**
   * Se é uma negação "soft" (UX) vs "hard" (segurança)
   * Soft: mostra elemento desabilitado
   * Hard: esconde elemento completamente
   */
  softDeny?: boolean;
}

/**
 * Configuração de gating para uma tela/feature
 */
export interface GateConfig {
  /**
   * Permissões necessárias (todas devem ser atendidas)
   */
  requiredPermissions?: Permission[];
  
  /**
   * Permissões alternativas (pelo menos uma deve ser atendida)
   */
  anyOfPermissions?: Permission[];
  
  /**
   * Roles que têm acesso (alternativa a permissões)
   */
  allowedRoles?: string[];
  
  /**
   * Mensagem customizada quando acesso negado
   */
  deniedMessage?: string;
  
  /**
   * Se deve esconder completamente vs mostrar desabilitado
   */
  hideWhenDenied?: boolean;
}

/**
 * Função de verificação de permissão customizada
 */
export type PermissionChecker = (
  profile: UserProfile,
  context?: PermissionContext
) => PermissionCheckResult;

