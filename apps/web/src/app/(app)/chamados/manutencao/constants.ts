// Constantes e tipos para chamados de Manutenção

// Transições de status permitidas para Manutenção
export const statusTransitions: Record<string, string[]> = {
  'awaiting_approval_encarregado': ['awaiting_approval_supervisor', 'denied'],
  'awaiting_approval_supervisor': ['awaiting_approval_gerente', 'denied'],
  'awaiting_approval_gerente': ['awaiting_triage', 'denied'],
  'awaiting_triage': ['in_progress', 'technical_analysis', 'denied'],
  'in_progress': ['technical_analysis', 'executing', 'denied', 'cancelled'],
  'technical_analysis': ['awaiting_approval', 'executing', 'denied'],
  'awaiting_approval': ['approved', 'denied'],
  'approved': ['executing'],
  'executing': ['waiting_parts', 'completed'],
  'waiting_parts': ['executing', 'completed'],
  'completed': ['evaluating'],
  'evaluating': ['closed'],
  'denied': ['awaiting_triage'], // Pode reenviar
  'closed': [],
  'cancelled': []
}

// Labels para status de Manutenção
export const statusLabels: Record<string, string> = {
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  'awaiting_triage': 'Aguardando Triagem',
  'in_progress': 'Em Andamento',
  'technical_analysis': 'Em Análise Técnica',
  'awaiting_approval': 'Em Aprovação',
  'approved': 'Aprovado',
  'executing': 'Executando Manutenção',
  'waiting_parts': 'Aguardando Peças/Materiais',
  'completed': 'Concluído',
  'evaluating': 'Em Avaliação',
  'closed': 'Fechado',
  'denied': 'Negado',
  'cancelled': 'Cancelado'
}

// Cores para badges de status
export const statusColors: Record<string, string> = {
  'awaiting_approval_encarregado': 'bg-amber-500 text-white',
  'awaiting_approval_supervisor': 'bg-amber-500 text-white',
  'awaiting_approval_gerente': 'bg-amber-500 text-white',
  'awaiting_triage': 'bg-sky-500 text-white',
  'in_progress': 'bg-blue-500 text-white',
  'technical_analysis': 'bg-purple-500 text-white',
  'awaiting_approval': 'bg-amber-500 text-white',
  'approved': 'bg-green-500 text-white',
  'executing': 'bg-blue-600 text-white',
  'waiting_parts': 'bg-orange-500 text-white',
  'completed': 'bg-emerald-500 text-white',
  'evaluating': 'bg-teal-500 text-white',
  'closed': 'bg-slate-400 text-white',
  'denied': 'bg-red-500 text-white',
  'cancelled': 'bg-slate-400 text-white',
}

// Tipos de manutenção
export const MAINTENANCE_TYPES = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  emergencial: 'Emergencial',
} as const

export type MaintenanceType = keyof typeof MAINTENANCE_TYPES

// Status de execução
export const EXECUTION_STATUS = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  completed: 'Concluída',
  cancelled: 'Cancelada',
} as const

export type ExecutionStatus = keyof typeof EXECUTION_STATUS

// Labels de prioridade
export const priorityLabels: Record<string, string> = {
  'low': 'Baixa',
  'medium': 'Média',
  'high': 'Alta',
  'urgent': 'Urgente'
}

// Cores para badges de prioridade
export const priorityColors: Record<string, string> = {
  'low': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

// Obtém transições permitidas para um status
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || []
}

