// Constantes para fornecedores credenciados

// Categorias de fornecedores
export const SUPPLIER_CATEGORIES = [
  { value: 'oficina', label: 'Oficina Mecânica' },
  { value: 'autopecas', label: 'Autopeças' },
  { value: 'funilaria', label: 'Funilaria e Pintura' },
  { value: 'vidraceiro', label: 'Vidraçaria Automotiva' },
  { value: 'eletricista', label: 'Eletricista Automotivo' },
  { value: 'borracharia', label: 'Borracharia' },
  { value: 'lavagem', label: 'Lavagem/Estética' },
  { value: 'guincho', label: 'Guincho/Reboque' },
  { value: 'seguradora', label: 'Seguradora' },
  { value: 'construcao', label: 'Construção/Reforma' },
  { value: 'eletrica', label: 'Elétrica Predial' },
  { value: 'hidraulica', label: 'Hidráulica' },
  { value: 'serralheria', label: 'Serralheria' },
  { value: 'outro', label: 'Outro' },
] as const

// Status de fornecedores
export const SUPPLIER_STATUS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
] as const

// Obter label da categoria
export function getCategoryLabel(value: string): string {
  const category = SUPPLIER_CATEGORIES.find(c => c.value === value)
  return category?.label || value
}

