import { redirect } from 'next/navigation'

/**
 * Página de Configurações de Checklists
 * 
 * Redireciona para /checklists/configurar pois a funcionalidade completa
 * de gerenciamento de templates e perguntas de checklists já existe
 * nessa rota.
 * 
 * @see /checklists/configurar - Gerenciamento de templates de checklist
 * @see /checklists/configurar/novo - Criação de novo template
 * @see /checklists/configurar/[templateId] - Detalhes do template
 */
export default function ConfiguracoesChecklistsPage() {
  redirect('/checklists/configurar')
}

