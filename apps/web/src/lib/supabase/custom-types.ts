/**
 * Tipos customizados da aplicação para usuários e funcionalidades relacionadas.
 * 
 * IMPORTANTE: Este arquivo contém tipos que NÃO são gerados automaticamente
 * pelo Supabase CLI. Mantenha separado do database.types.ts.
 */

// Status possíveis do usuário
export type UserStatus = 'active' | 'pending' | 'inactive'

// Status do convite
export type InvitationStatus = 'not_sent' | 'pending' | 'expired' | 'accepted'

// Informações do cargo do usuário
export interface UserRoleInfo {
  role_id: string
  role_name: string
  department_id: string | null
  department_name: string | null
  is_global: boolean
}

// Informações da unidade do usuário
export interface UserUnitInfo {
  id: string
  unit_id: string
  unit_name: string
  unit_code: string
  is_coverage: boolean
}

// Usuário com seus cargos e unidades
export interface UserWithRoles {
  id: string
  full_name: string
  email: string
  phone: string | null
  cpf: string | null
  avatar_url: string | null
  status: UserStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
  invitation_sent_at: string | null
  invitation_expires_at: string | null
  roles: UserRoleInfo[]
  units?: UserUnitInfo[]
}

// Log de auditoria
export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  user_id: string | null
  created_at: string | null
}

// ============================================
// Tipos de Unidades
// ============================================

// Status possíveis da unidade
export type UnitStatus = 'active' | 'inactive'

// Unidade básica
export interface Unit {
  id: string
  code: string
  name: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null
  email: string | null
  capacity: number | null
  status: UnitStatus
  region: string | null
  administrator: string | null
  supervisor_name: string | null
  cnpj: string | null
  neighborhood: string | null
  created_at: string | null
  updated_at: string | null
}

// Unidade com contagem de funcionários
export interface UnitWithStaffCount extends Unit {
  staff_count: number
}

// Membro da equipe de uma unidade
export interface UnitStaffMember {
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
  is_coverage: boolean
  role_name: string | null
  department_name: string | null
}

// ============================================
// Funções Utilitárias
// ============================================

/**
 * Determina o status do convite de um usuário baseado em seus campos.
 * 
 * @param user - Usuário com informações de convite
 * @returns Status do convite: 'pending', 'sent', 'expired' ou 'accepted'
 */
export function getInvitationStatus(user: UserWithRoles): InvitationStatus {
  // Se usuário já está ativo, convite foi aceito
  if (user.status === 'active') {
    return 'accepted'
  }

  // Se não tem data de envio, convite não foi enviado ainda
  if (!user.invitation_sent_at) {
    return 'not_sent'
  }

  // Se tem data de expiração e já passou, convite expirou
  if (user.invitation_expires_at) {
    const expiresAt = new Date(user.invitation_expires_at)
    if (expiresAt < new Date()) {
      return 'expired'
    }
  }

  // Convite foi enviado e ainda é válido (aguardando)
  return 'pending'
}

