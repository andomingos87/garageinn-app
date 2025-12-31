// Constantes e tipos para chamados de sinistros

// Tipos de ocorrência
export const OCCURRENCE_TYPES = [
  { value: 'colisao', label: 'Colisão' },
  { value: 'risco', label: 'Risco/Arranhão' },
  { value: 'furto', label: 'Furto/Roubo' },
  { value: 'vandalismo', label: 'Vandalismo' },
  { value: 'queda_objeto', label: 'Queda de Objeto' },
  { value: 'alagamento', label: 'Alagamento' },
  { value: 'incendio', label: 'Incêndio' },
  { value: 'queda_pessoa', label: 'Queda de Pessoa' },
  { value: 'acidente_trabalho', label: 'Acidente de Trabalho' },
  { value: 'outro', label: 'Outro' },
] as const

// Transições de status permitidas para sinistros
export const statusTransitions: Record<string, string[]> = {
  // Fase de aprovação (quando aberto por Manobrista)
  'awaiting_approval_encarregado': ['awaiting_approval_supervisor', 'denied'],
  'awaiting_approval_supervisor': ['awaiting_approval_gerente', 'denied'],
  'awaiting_approval_gerente': ['awaiting_triage', 'denied'],
  // Fase de triagem e análise
  'awaiting_triage': ['in_analysis', 'denied'],
  'in_analysis': ['in_investigation', 'awaiting_customer', 'awaiting_quotations', 'in_repair', 'denied'],
  'in_investigation': ['in_analysis', 'awaiting_customer', 'awaiting_quotations', 'denied'],
  'awaiting_customer': ['in_analysis', 'in_investigation', 'awaiting_quotations', 'in_repair', 'denied'],
  'awaiting_quotations': ['in_repair', 'awaiting_customer', 'denied'],
  'in_repair': ['awaiting_payment', 'resolved', 'denied'],
  'awaiting_payment': ['resolved', 'denied'],
  'resolved': ['closed'],
  'denied': ['awaiting_triage'], // Pode reenviar
  'closed': [],
  'cancelled': [],
}

// Labels para status de sinistros
export const statusLabels: Record<string, string> = {
  // Fase de aprovação
  'awaiting_approval_encarregado': 'Aguardando Aprovação (Encarregado)',
  'awaiting_approval_supervisor': 'Aguardando Aprovação (Supervisor)',
  'awaiting_approval_gerente': 'Aguardando Aprovação (Gerente)',
  // Fase de triagem e análise
  'awaiting_triage': 'Aguardando Triagem',
  'in_analysis': 'Em Análise',
  'in_investigation': 'Em Investigação',
  'awaiting_customer': 'Aguardando Cliente',
  'awaiting_quotations': 'Aguardando Cotações',
  'in_repair': 'Em Reparo',
  'awaiting_payment': 'Aguardando Pagamento',
  'resolved': 'Resolvido',
  'denied': 'Negado',
  'closed': 'Fechado',
  'cancelled': 'Cancelado',
}

// Obtém transições permitidas para um status
export function getAllowedTransitions(currentStatus: string): string[] {
  return statusTransitions[currentStatus] || []
}

// Canais de comunicação
export const COMMUNICATION_CHANNELS = [
  { value: 'telefone', label: 'Telefone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'outro', label: 'Outro' },
] as const

// Status de compras internas
export const PURCHASE_STATUS = [
  { value: 'awaiting_quotation', label: 'Aguardando Cotação' },
  { value: 'quotations_received', label: 'Cotações Recebidas' },
  { value: 'awaiting_approval', label: 'Aguardando Aprovação' },
  { value: 'approved', label: 'Aprovada' },
  { value: 'rejected', label: 'Rejeitada' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
] as const

// Tipos de resolução
export const RESOLUTION_TYPES = [
  { value: 'reparo_interno', label: 'Reparo Interno' },
  { value: 'reparo_externo', label: 'Reparo Externo' },
  { value: 'indenizacao', label: 'Indenização' },
  { value: 'acordo', label: 'Acordo' },
  { value: 'negado', label: 'Negado' },
] as const

// Determinação de responsabilidade
export const LIABILITY_OPTIONS = [
  { value: 'empresa', label: 'Empresa' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'terceiro', label: 'Terceiro' },
  { value: 'compartilhada', label: 'Compartilhada' },
  { value: 'indefinida', label: 'A Definir' },
] as const

