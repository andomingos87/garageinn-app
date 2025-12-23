import { redirect } from 'next/navigation'

/**
 * Página de Configurações de Unidades
 * 
 * Redireciona para /unidades pois as configurações de unidades
 * (templates de checklist, equipe, etc.) são gerenciadas diretamente
 * na página de detalhes de cada unidade.
 * 
 * @see /unidades/[id] - Detalhes da unidade com métricas e equipe
 * @see /unidades/[id]/editar - Edição de dados da unidade
 */
export default function ConfiguracoesUnidadesPage() {
  redirect('/unidades')
}

