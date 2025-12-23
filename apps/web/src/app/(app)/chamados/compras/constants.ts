// Constantes e tipos para chamados de compras

// Transições de status permitidas
export const statusTransitions: Record<string, string[]> = {
  'awaiting_approval_encarregado': ['awaiting_approval_supervisor', 'denied'],
  'awaiting_approval_supervisor': ['awaiting_approval_gerente', 'denied'],
  'awaiting_approval_gerente': ['awaiting_triage', 'denied'],
  'awaiting_triage': ['in_progress', 'quoting', 'denied'],
  'in_progress': ['quoting', 'denied', 'cancelled'],
  'quoting': ['awaiting_approval', 'approved', 'denied'],
  'awaiting_approval': ['approved', 'denied'],
  'approved': ['purchasing'],
  'purchasing': ['in_delivery'],
  'in_delivery': ['delivered'],
  'delivered': ['evaluating'],
  'evaluating': ['closed'],
  'denied': ['awaiting_triage'], // Pode reenviar
  'closed': [],
  'cancelled': []
}

// Labels para status
export const statusLabels: Record<string, string> = {
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  'awaiting_triage': 'Aguardando Triagem',
  'in_progress': 'Em Andamento',
  'quoting': 'Em Cotação',
  'awaiting_approval': 'Aguardando Aprovação',
  'approved': 'Aprovado',
  'purchasing': 'Executando Compra',
  'in_delivery': 'Em Entrega',
  'delivered': 'Entrega Realizada',
  'evaluating': 'Em Avaliação',
  'closed': 'Fechado',
  'denied': 'Negado',
  'cancelled': 'Cancelado'
}

// Obtém transições permitidas para um status
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || []
}

