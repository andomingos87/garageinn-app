# PRD - Gapp (Garageinn App)

## 1. Visão Geral

### 1.1 Sobre o Produto
O **Gapp** é uma aplicação de gestão de chamados e checklists operacionais desenvolvida para a **Garageinn**, uma rede de estacionamentos. O sistema utiliza controle de acesso baseado em funções (RBAC) para gerenciar permissões entre múltiplos departamentos e cargos.

### 1.2 Plataformas
- **Web**: Aplicação responsiva para navegadores modernos
- **Mobile**: Aplicativos nativos para iOS e Android

### 1.3 Objetivos Principais
1. Centralizar a gestão de chamados entre departamentos
2. Digitalizar e padronizar checklists operacionais
3. Facilitar a comunicação entre unidades e departamentos administrativos
4. Prover visibilidade gerencial sobre operações e demandas

---

## 2. Usuários e Permissões (RBAC)

### 2.1 Estrutura Organizacional

O sistema segue uma estrutura hierárquica de departamentos e cargos. **Um usuário pode ter múltiplos cargos em múltiplos departamentos**.

#### 2.1.1 Cargos Globais (Sem vínculo com departamento específico)
| Cargo | Descrição |
|-------|-----------|
| Desenvolvedor | Acesso total ao sistema para manutenção e desenvolvimento |
| Diretor | Visão executiva completa de todos os departamentos |
| Administrador | Gestão administrativa geral do sistema |

#### 2.1.2 Departamento: Operações
| Cargo | Vínculo com Unidade |
|-------|---------------------|
| Manobrista | Uma unidade específica |
| Encarregado | Uma unidade específica |
| Supervisor | Múltiplas unidades (cobertura) |
| Gerente | Todas as unidades |

#### 2.1.3 Departamento: Compras e Manutenção
| Cargo |
|-------|
| Assistente |
| Comprador |
| Gerente |

#### 2.1.4 Departamento: Financeiro
| Cargo |
|-------|
| Auxiliar |
| Assistente |
| Analista Júnior |
| Analista Pleno |
| Analista Sênior |
| Supervisor |
| Gerente |

#### 2.1.5 Departamento: RH
| Cargo |
|-------|
| Auxiliar |
| Assistente |
| Analista Júnior |
| Analista Pleno |
| Analista Sênior |
| Supervisor |
| Gerente |

#### 2.1.6 Departamento: Sinistros
| Cargo |
|-------|
| Supervisor |
| Gerente |

#### 2.1.7 Departamento: Comercial
| Cargo |
|-------|
| Gerente |

#### 2.1.8 Departamento: Auditoria
| Cargo |
|-------|
| Auditor |
| Gerente |

#### 2.1.9 Departamento: TI
| Cargo |
|-------|
| Analista |
| Gerente |

### 2.2 Regras de Vínculo com Unidades

| Tipo de Vínculo | Cargos Aplicáveis |
|-----------------|-------------------|
| **Uma unidade** | Manobrista, Encarregado |
| **Múltiplas unidades** | Supervisor (Operações) |
| **Sem vínculo** (trabalham para todas) | Todos os demais cargos |

### 2.3 Modelo de acesso e união de permissões (MVP)

- **União de permissões (RBAC)**: se o usuário possuir múltiplos cargos/departamentos, o sistema **soma automaticamente** as permissões (não há “troca de contexto” por perfil).
- **Modelo de acesso (misto)**:
  - **Por Departamento**: a execução do trabalho e a caixa de entrada são organizadas pelo **Departamento Destinatário** (ex.: Compras, Manutenção, RH, TI).
  - **Por Unidade/Cobertura (Operações)**: usuários de Operações também navegam por **unidade** (ou **cobertura**), pois a rotina é local.
- **Escopo por unidade (visibilidade)**:
  - **Manobrista/Encarregado**: veem itens da **sua unidade** (e os seus próprios registros).
  - **Supervisor (Operações)**: vê chamados e checklists de **todas as unidades sob cobertura**.
  - **Gerente (Operações)**: vê **todas as unidades**.
  - **Demais departamentos**: não possuem vínculo obrigatório com unidade e podem atuar sobre **todas as unidades** (filtrando por unidade quando necessário).

---

## 3. Funcionalidades Principais

### 3.1 Sistema de Chamados

#### 3.1.1 Descrição
Sistema centralizado para criação, acompanhamento e resolução de chamados entre departamentos e unidades.

#### 3.1.2 Tipos de Chamados por Departamento

| Departamento Destinatário | Exemplos de Chamados |
|--------------------------|----------------------|
| **Compras** | Solicitação de materiais, equipamentos, compras em geral |
| **Manutenção** | Reparos estruturais, elétricos, hidráulicos |
| **Sinistros** | Registro de acidentes, danos a veículos, ocorrências |
| **RH** | Solicitações de pessoal, questões de salario, vr e vt, Gestão de uniformes (Compra, estoque e retirada) |
| **TI** | Suporte técnico, solicitação de equipamentos, sistemas |

#### 3.1.3 Fluxo do Chamado

```
[Criação] → [Aguardando Aprovações*] → [Aguardando Triagem] → [Priorizado] → [Em Andamento] → [Aguardando Retorno] → [Resolvido] → [Fechado]
                             ↓                    ↓                                                       ↓
                          [Negado]             [Negado]                                              [Cancelado]
```

*Etapa aplicada apenas quando houver aprovações internas (Operações → Compras/Manutenção).*

> **Nota (MVP)**: Chamados de **Compras** e **Manutenção** utilizam status específicos (ver 3.1.8).

**Descrição dos Status:**
| Status | Descrição |
|--------|-----------|
| Aguardando Aprovações (Operações) | Chamado aguardando aprovações internas (Encarregado → Supervisor → Gerente) antes de seguir para triagem no departamento destinatário |
| Aguardando Triagem | Chamado criado, aguardando análise do departamento destinatário |
| Priorizado | Departamento definiu prioridade e responsável, aguardando início |
| Em Andamento | Responsável está trabalhando na demanda |
| Aguardando Retorno | Responsável aguarda informação/ação do solicitante |
| Resolvido | Demanda atendida, aguardando confirmação do solicitante |
| Fechado | Chamado encerrado definitivamente |
| Negado | Chamado negado na aprovação ou triagem. **Justificativa obrigatória**. Retorna ao autor para **fechar** ou **editar e reenviar** |
| Cancelado | Solicitante cancelou a demanda |

#### 3.1.4 Campos do Chamado

**Campos preenchidos pelo Solicitante (criação):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Título | Texto | Sim |
| Departamento Destinatário | Seleção | Sim |
| Unidade(s) | Seleção/Multi-seleção | Quando aplicável |
| Descrição/Justificativa | Texto longo | Sim |
| Urgência Percebida | Baixa/Média/Alta | Não |
| Anexos | Arquivos/Imagens | Não |

> **Nota sobre Urgência Percebida**: Campo opcional e meramente informativo. Permite ao solicitante indicar como ele percebe a urgência da demanda, mas **não define a prioridade oficial** do chamado.

> **Campos específicos por Departamento (MVP)**: ver `projeto/chamados/abertura.md` (ex.: Compras com categoria/itens/quantidade/justificativa; Manutenção com assunto/descrição/unidade(s)).

**Campos preenchidos pelo Departamento Destinatário (triagem):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Prioridade | Baixa/Média/Alta/Urgente | Sim (na triagem) |
| Responsável | Usuário do departamento | Sim (na triagem) |
| Previsão de Conclusão | Data | Não |
| Justificativa da negação | Texto | Obrigatório ao negar |

> **Regra de Priorização**: A prioridade oficial é definida exclusivamente pelo Gerente ou Supervisor do departamento destinatário durante a triagem do chamado. Isso garante uma visão imparcial e contextualizada considerando todas as demandas em andamento.

#### 3.1.5 Funcionalidades do Chamado

- **Criação**: Qualquer usuário pode criar chamados
- **Visualização**: Baseada em permissões do cargo/departamento
- **Comentários**: Thread de discussão em cada chamado
- **Histórico**: Auditoria mínima (MVP) — registro de eventos principais (criação, aprovações, triagem, mudanças de status, comentários)
- **Notificações**: Standby (MVP sem notificações; futuro via webhooks/N8N)
- **Filtros**: Por status, prioridade, departamento, unidade, data
- **Busca**: Pesquisa por título, descrição, número do chamado

#### 3.1.6 Permissões de Chamados

| Ação | Quem pode executar |
|------|-------------------|
| Criar chamado | Todos os usuários |
| Visualizar chamados | Conforme regras de visibilidade (2.3) |
| **Triar chamado** (definir prioridade e responsável) | Gerentes e Supervisores do departamento destinatário |
| Aprovar chamado (quando aplicável) | Encarregado → Supervisor → Gerente (Operações) |
| Negar chamado | Aprovadores (quando aplicável) e Gerentes/Supervisores do departamento destinatário (**justificativa obrigatória**) |
| Alterar status | Responsável pelo chamado, Gerentes |
| Fechar chamado | Autor (após resolução), Gerentes |
| Cancelar chamado | Autor, Gerentes |
| Reabrir chamado | Autor (até 7 dias após fechamento), Gerentes |

#### 3.1.7 Aprovações (MVP)

📄 Referência: `projeto/chamados/aprovacoes.md`

- **Regra exclusiva para Departamento de Operações** quando **Manobrista** abre chamado para **Compras** ou **Manutenção**:
  - Aprovação em cadeia: **Encarregado → Supervisor → Gerente**
  - Após aprovação do Gerente, o chamado segue para o **Departamento Destinatário** para triagem/execução
  - **Negado**: justificativa obrigatória e retorna ao autor para **fechar** ou **editar e reenviar**
- **Demais cenários**: chamados entram direto em **Aguardando Triagem** no Departamento Destinatário (sem aprovações).

#### 3.1.8 Abertura e execução por Departamento (MVP)

📄 Referências: `projeto/chamados/abertura.md` e `projeto/chamados/execuções.md`

- **Status do chamado de Compras**: Em andamento; Em cotação; Em aprovação; Aprovado; Executando compra; Em entrega; Entrega realizada; Avaliação da entrega; Negado.
- **Status do chamado de Manutenção**: Em andamento; Em análise técnica; Em aprovação; Aprovado; Executando manutenção; Aguardando peças/materiais; Concluído; Avaliação da execução; Negado.

---

### 3.2 Checklists

#### 3.2.1 Checklist de Abertura

**Objetivo**: Verificação diária das condições da garagem no início das operações.

**Características**:
- Executado diariamente na abertura de cada unidade
- Composto por perguntas de **Sim/Não**
- Perguntas são **dinâmicas por unidade**
- Configurável via painel administrativo

**Campos da Pergunta**:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Texto da pergunta | Texto | A pergunta em si |
| Ordem | Número | Posição no checklist |
| Obrigatória | Boolean | Se pode ser pulada |
| Observação obrigatória se "Não" | Boolean | Exige justificativa |
| Ativo | Boolean | Se está em uso |

**Campos da Execução**:
| Campo | Tipo |
|-------|------|
| Unidade | Referência |
| Data/Hora de execução | Timestamp |
| Executado por | Referência ao usuário |
| Respostas | Array de respostas |
| Observações gerais | Texto |
| Fotos | Array de imagens |

**Fluxo**:
1. Encarregado/Manobrista inicia o checklist de abertura
2. Responde cada pergunta (Sim/Não)
3. Adiciona observações quando necessário
4. Finaliza e envia o checklist
5. Sistema registra não-conformidades para acompanhamento por Supervisores/Gerentes (sem notificações no MVP)

#### 3.2.2 Checklist de Supervisão

**Objetivo**: Avaliação periódica das unidades pelos supervisores durante visitas.

**Características**:
- Executado durante visitas de supervisão
- **Cada unidade possui seu próprio checklist**
- Supervisores podem **criar e editar** checklists das unidades sob sua cobertura
- Formato flexível de perguntas

**Tipos de Perguntas Suportados**:
| Tipo | Descrição |
|------|-----------|
| Sim/Não | Resposta binária |
| Nota (1-5) | Avaliação numérica |
| Texto | Resposta dissertativa |
| Múltipla escolha | Seleção de opções |
| Foto obrigatória | Exige anexo de imagem |

**Campos da Execução**:
| Campo | Tipo |
|-------|------|
| Unidade visitada | Referência |
| Supervisor | Referência ao usuário |
| Data/Hora início | Timestamp |
| Data/Hora fim | Timestamp |
| Respostas | Array de respostas |
| Pontuação geral | Calculada |
| Observações | Texto |
| Fotos | Array de imagens |
| Assinatura do Encarregado | Imagem |

**Fluxo**:
1. Supervisor seleciona a unidade a ser visitada
2. Sistema carrega o checklist específico da unidade
3. Supervisor executa a avaliação item a item
4. Finaliza a supervisão
5. Relatório é gerado e disponibilizado

---

### 3.3 Gestão de Unidades

#### 3.3.1 Cadastro de Unidades

**Campos Principais**:
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | Texto | Sim |
| Código | Texto único | Sim |
| Endereço completo | Texto | Sim |
| CEP | Texto | Sim |
| Cidade | Texto | Sim |
| Estado | Seleção | Sim |
| Telefone | Texto | Não |
| Email | Email | Não |
| Capacidade (vagas) | Número | Sim |
| Horário de funcionamento | Horários | Sim |
| Status | Ativo/Inativo | Sim |
| Foto da fachada | Imagem | Não |
| Coordenadas GPS | Lat/Long | Não |

#### 3.3.2 Informações Adicionais da Unidade

| Seção | Campos |
|-------|--------|
| **Contatos** | Telefones adicionais, emails departamentais |
| **Infraestrutura** | Número de andares, elevadores, rampas |
| **Serviços** | Lavagem, manobrista 24h, mensalistas |
| **Documentação** | Alvará, AVCB, contratos |
| **Observações** | Notas gerais sobre a unidade |

#### 3.3.3 Funcionalidades da Tela de Unidades

- **Lista de unidades**: Visualização em cards ou tabela
- **Busca e filtros**: Por nome, cidade, status
- **Detalhes da unidade**: Página completa com todas informações
- **Edição**: Atualização de dados cadastrais
- **Histórico**: Log de alterações
- **Equipe**: Lista de funcionários vinculados
- **Métricas**: Chamados, checklists, indicadores

---

### 3.4 Gestão de Usuários

#### 3.4.1 Cadastro de Usuários

**Campos Obrigatórios**:
| Campo | Tipo | Validação |
|-------|------|-----------|
| Nome completo | Texto | Mínimo 3 caracteres |
| Email | Email | Único no sistema |
| Telefone | Texto | Formato válido | Máscara de telefone com DDD
| CPF | Texto | Válido e único | Máscara de CPF com pontos e traços

**Campos de Vínculo**:
| Campo | Tipo | Regra |
|-------|------|-------|
| Departamento(s) | Multi-seleção | Obrigatório ao menos um |
| Cargo(s) | Multi-seleção | Por departamento selecionado |
| Unidade(s) | Seleção | Obrigatório para Manobrista/Encarregado |
| Unidades de cobertura | Multi-seleção | Obrigatório para Supervisor (Operações) |

#### 3.4.2 Fluxo de Criação

1. Administrador acessa tela de usuários
2. Clica em "Novo Usuário"
3. Preenche dados básicos
4. Seleciona departamento(s)
5. Para cada departamento, seleciona cargo(s)
6. Se cargo exigir, seleciona unidade(s)
7. Sistema envia email de boas-vindas com **magic link** (Supabase Auth) para primeiro acesso
8. Usuário acessa via link e completa o primeiro acesso

#### 3.4.3 Status do Usuário

| Status | Descrição |
|--------|-----------|
| Ativo | Acesso liberado |
| Inativo | Acesso bloqueado (mantém histórico) |
| Pendente | Aguardando primeiro acesso |

---

### 3.5 Perfil do Usuário

#### 3.5.1 Informações Exibidas

**Dados Pessoais**:
- Foto de perfil
- Nome completo
- Email
- Telefone
- CPF (parcialmente oculto)

**Dados Profissionais**:
- Departamento(s) e Cargo(s)
- Unidade(s) vinculada(s)
- Data de cadastro
- Último acesso

#### 3.5.2 Ações Disponíveis

| Ação | Descrição |
|------|-----------|
| Editar foto | Upload de nova foto de perfil |
| Alterar telefone | Atualização do número |
| Sair | Logout do sistema |

---

## 4. Arquitetura Técnica

### 4.1 Stack Tecnológico (Sugestão)

| Camada | Tecnologia |
|--------|------------|
| **Frontend Web** | React.js / Next.js |
| **Mobile Híbrido** | React Native |
| **Backend** | Node.js / NestJS |
| **Banco de Dados** | PostgreSQL Supabase |
| **Autenticação** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Integrações/Notificações (standby)** | Webhooks/N8N (WhatsApp/Email); (pós-MVP: Firebase Cloud Messaging) |
| **Hospedagem** | Vercel |

### 4.2 Modelo de Dados Simplificado

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuário   │────<│UsuárioCargo │>────│    Cargo    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       │            ┌──────────────┐            │
       └───────────<│UsuárioUnidade│           │
                    └──────────────┘            │
                           │                    │
                    ┌──────────────┐     ┌─────────────┐
                    │   Unidade    │     │Departamento │
                    └──────────────┘     └─────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Chamado    │   │  Checklist   │   │  Supervisão  │
│              │   │   Abertura   │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

### 4.3 Integrações Futuras

| Sistema | Finalidade |
|---------|------------|
| ERP | Sincronização de dados financeiros |
| Sistema de Ponto | Controle de jornada |
| BI | Dashboards gerenciais |
| WhatsApp Business | Notificações via automações (ex.: N8N/webhooks) |

---

## 5. Interface do Usuário

### 5.1 Navegação Principal (Web)

```
┌─────────────────────────────────────────────────────────────┐
│  🅖 Gapp                    🔔  👤 João Silva  ▼            │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│  🏠 Início  │                                               │
│             │                                               │
│  📋 Chamados│         [Conteúdo Principal]                  │
│             │                                               │
│  ✅ Checklists                                              │
│             │                                               │
│  🏢 Unidades│                                               │
│             │                                               │
│  👥 Usuários│                                               │
│             │                                               │
│  ⚙️ Config  │                                               │
│             │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

### 5.2 Navegação Principal (Mobile)

```
┌─────────────────────────┐
│  🅖 Gapp           🔔   │
├─────────────────────────┤
│                         │
│                         │
│    [Conteúdo Principal] │
│                         │
│                         │
├─────────────────────────┤
│ 🏠   📋   ✅   🏢   👤  │
│Início Chamados Check Unid Perfil│
└─────────────────────────┘
```

### 5.3 Telas Principais

| Tela | Descrição |
|------|-----------|
| **Dashboard** | Resumo de chamados, checklists pendentes, alertas |
| **Lista de Chamados** | Todos os chamados com filtros e busca |
| **Detalhe do Chamado** | Informações completas, comentários, ações |
| **Novo Chamado** | Formulário de criação |
| **Checklists** | Lista de checklists disponíveis |
| **Executar Checklist** | Interface de preenchimento |
| **Lista de Unidades** | Cards/tabela com todas unidades |
| **Detalhe da Unidade** | Informações completas da unidade |
| **Lista de Usuários** | Gestão de usuários (admin) |
| **Perfil** | Dados do usuário logado |
| **Configurações** | Preferências e configurações do sistema |

### 5.4 Design System

O GAPP possui um **Design System** documentado que define todos os padrões visuais e componentes de interface.

📄 **Documentação completa**: [design-system.md](../design-system.md)

#### 5.4.1 Identidade Visual

| Elemento | Especificação |
|----------|---------------|
| **Cor Primária** | Vermelho vibrante `hsl(0, 95%, 60%)` — identidade GarageInn |
| **Fonte** | Inter (sans-serif) |
| **Border Radius** | 8px (base) |
| **Espaçamento** | Sistema baseado em múltiplos de 4px |

#### 5.4.2 Temas

No **MVP**, o sistema terá apenas **Light Mode**.

| Modo | Background | Foreground |
|------|------------|------------|
| Light | `hsl(0, 0%, 98%)` | `hsl(0, 0%, 10%)` |

> **Dark Mode**: pós-MVP.

#### 5.4.3 Componentes Base

O sistema utiliza componentes **shadcn/ui** customizados:

- **Buttons**: Variantes default, secondary, outline, ghost, destructive
- **Cards**: Container padrão para agrupamento de informações
- **Badges**: Status e tags com cores semânticas
- **Tables**: Listagens com ordenação e filtros
- **Forms**: Inputs com validação e feedback visual
- **Sidebar**: Navegação lateral colapsável

#### 5.4.4 Cores Semânticas

| Status | Cor | Uso |
|--------|-----|-----|
| Success | `hsl(142, 76%, 36%)` | Confirmações, aprovado |
| Warning | `hsl(38, 92%, 50%)` | Alertas, pendente |
| Info | `hsl(199, 89%, 48%)` | Informações, em análise |
| Destructive | `hsl(0, 84%, 60%)` | Erros, urgente |

#### 5.4.5 Responsividade

| Breakpoint | Min-width | Dispositivo |
|------------|-----------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1400px | Container máximo |

> **Nota**: Para especificações detalhadas de componentes, tokens de cor, tipografia e exemplos de código, consulte o [Design System completo](../design-system.md).

---

## 6. Notificações

**MVP**: sem notificações (push/email/WhatsApp).

**Standby (em breve / pós-MVP)**:
- Eventos do sistema poderão disparar **webhooks** para automações (ex.: **N8N**) enviar mensagens (WhatsApp/email) e/ou push.
- A lista de eventos prioritários será definida junto da implementação.

---

## 7. Relatórios e Métricas

> **Pós-MVP**: dashboards e relatórios completos podem ser desenvolvidos após estabilização do fluxo de chamados/checklists.

### 7.1 Dashboard Gerencial

| Métrica | Descrição |
|---------|-----------|
| Chamados abertos | Total de chamados não resolvidos |
| Tempo médio de resolução | Por departamento |
| Chamados por prioridade | Distribuição |
| Taxa de conformidade | % de "Sim" nos checklists |
| Unidades supervisionadas | No período |
| Top unidades com chamados | Ranking |

### 7.2 Relatórios Disponíveis

| Relatório | Periodicidade | Formato |
|-----------|---------------|---------|
| Chamados por período | Sob demanda | PDF/Excel |
| Histórico de checklists | Mensal | PDF |
| Supervisões realizadas | Semanal/Mensal | PDF |
| Indicadores operacionais | Mensal | Dashboard |

---

## 8. Segurança

### 8.1 Autenticação (Supabase Auth)

- Login com email e senha
- Senha com requisitos mínimos (6 caracteres - padrão Supabase)
- Recuperação de senha por email (magic link)
- Sessão gerenciada automaticamente pelo Supabase
- Refresh token automático com validade configurável
- Suporte futuro a login social (Google, Apple) se necessário

### 8.2 Autorização (RBAC)

- Permissões baseadas em cargo e departamento
- Verificação de vínculo com unidade quando aplicável
- Logs de auditoria para ações sensíveis
- Segregação de dados por unidade/departamento

### 8.3 Dados

- Criptografia em trânsito (HTTPS/TLS)
- Criptografia em repouso para dados sensíveis
- Backup diário automatizado
- LGPD compliance

---

## 9. Roadmap de Desenvolvimento

> **Nota**: Cronograma baseado nos entregáveis contratuais. Detalhes em `projeto/entregaveis/`.

---

### 📅 Entrega 1 — 23 de Dezembro de 2025
**Módulos**: Operações (Chamados e Checklists), Compras, Manutenção, RH (Uniformes e chamados gerais)

#### Infraestrutura e Bootstrap
- [ ] Configurar projeto Next.js com TypeScript
- [ ] Configurar Tailwind CSS e shadcn/ui
- [ ] Configurar projeto Supabase (Database, Auth, Storage)
- [ ] Criar estrutura de pastas e arquivos base
- [ ] Configurar ESLint, Prettier e padrões de código
- [ ] Criar componentes base do Design System
- [ ] Configurar variáveis de ambiente
- [ ] Criar layout principal (Sidebar, Header, Content)

#### Autenticação
- [ ] Configurar Supabase Auth
- [ ] Criar tela de Login
- [ ] Criar tela de Recuperação de Senha
- [ ] Implementar middleware de proteção de rotas
- [ ] Criação de usuário admin
- [ ] Impersonação para usuário admin

#### Gestão de Usuários
- [ ] Criar modelo de dados: `users`, `departments`, `roles`, `user_roles`
- [ ] Criar tela de listagem de usuários
- [ ] Criar tela de cadastro/edição de usuário
- [ ] Implementar RBAC (permissões por cargo/departamento)
- [ ] Criar página de perfil do usuário

#### Gestão de Unidades
- [ ] Criar modelo de dados: `units`, `user_units`
- [ ] Criar tela de listagem de unidades
- [ ] Criar tela de cadastro/edição de unidade
- [ ] Criar tela de detalhes da unidade
- [ ] Implementar vínculo usuário-unidade

#### Checklists
- [ ] Criar modelo de dados: `checklist_templates`, `checklist_questions`, `checklist_executions`, `checklist_answers`
- [ ] Criar tela de configuração de checklist de abertura (admin)
- [ ] Criar tela de execução de checklist de abertura
- [ ] Criar tela de histórico de checklists executados
- [ ] Usuário admin pode excluir checklists (unitário e em massa)

#### Chamados — Compras
- [ ] Criar modelo de dados: `tickets`, `ticket_comments`, `ticket_attachments`, `ticket_history`
- [ ] Criar tela de abertura de chamado de Compras
- [ ] Criar tela de listagem de chamados de Compras
- [ ] Implementar fluxo de execução do chamado de Compras
- [ ] Implementar triagem e priorização

#### Chamados — Manutenção
- [ ] Criar tela de abertura de chamado de Manutenção
- [ ] Criar tela de listagem de chamados de Manutenção
- [ ] Implementar fluxo de execução do chamado de Manutenção

#### Chamados — RH (Uniformes e Gerais)
- [ ] Criar tela de abertura de chamado de RH
- [ ] Criar tela de listagem de chamados de RH
- [ ] Implementar fluxo de execução do chamado de RH
- [ ] Implementar gestão de uniformes (compra, estoque, retirada)

#### Admin
- [ ] Usuário admin pode excluir chamados (unitário e em massa)

---

### 📅 Entrega 2 — 05 de Janeiro de 2026
**Módulos**: Sinistros, Comercial

#### Chamados — Sinistros
- [x] Criar modelo de dados: `ticket_claim_details`, `accredited_suppliers`, `claim_purchases`, `claim_purchase_items`, `claim_purchase_quotations`, `claim_communications`
- [x] Configurar RLS para todas as tabelas de sinistros
- [x] Criar categorias de sinistros (Veículo de Cliente, Veículo de Terceiro, Estrutura da Unidade, Equipamento, Pessoa/Acidente)
- [x] Criar tela de abertura de chamado de Sinistros
- [ ] Criar tela de listagem de chamados de Sinistros
- [ ] Implementar fluxo de execução do chamado de Sinistros
- [ ] Implementar sistema de compras internas
- [ ] Implementar comunicações com cliente
- [ ] Implementar registro de ocorrências e danos

#### Chamados — Comercial
- [ ] Criar tela de abertura de chamado Comercial
- [ ] Criar tela de listagem de chamados Comercial
- [ ] Implementar fluxo de execução do chamado Comercial

#### Checklist de Supervisão
- [ ] Implementar checklist de supervisão (por unidade)
- [ ] Criar tela de criação/edição de checklist de supervisão
- [ ] Criar tela de execução de supervisão
- [ ] Implementar relatório de supervisão

---

### 📅 Entrega 3 — 09 de Janeiro de 2026
**Módulos**: Financeiro, Configurações, Relatórios

#### Chamados — Financeiro
- [ ] Criar tela de abertura de chamado Financeiro
- [ ] Criar tela de listagem de chamados Financeiro
- [ ] Implementar fluxo de execução do chamado Financeiro

#### Configurações
- [ ] Criar tela de configurações gerais do sistema
- [ ] Configurações de notificações
- [ ] Configurações de departamentos e cargos
- [ ] Configurações de templates de checklist

#### Dashboard e Relatórios
- [ ] Criar Dashboard com métricas principais
- [ ] Implementar gráficos de chamados (por status, departamento, período)
- [ ] Implementar indicadores de checklists
- [ ] Criar relatório de chamados (filtros + exportação)
- [ ] Criar relatório de supervisões
- [ ] Criar relatório de conformidade de checklists

---

### 📅 Entrega 4 — 16 de Janeiro de 2026
**Módulo**: Aplicativo Mobile

#### Configuração do Projeto
- [ ] Configurar projeto React Native
- [ ] Configurar navegação e estrutura base
- [ ] Implementar autenticação mobile

#### Funcionalidades Mobile
- [ ] Criar tela de Dashboard mobile
- [ ] Criar fluxo de chamados (listar, criar, visualizar)
- [ ] Criar fluxo de checklist de abertura
- [ ] Criar fluxo de checklist de supervisão
- [ ] Implementar câmera para anexos e fotos

#### Notificações e Publicação
- [ ] Configurar Firebase Cloud Messaging (push notifications)
- [ ] Implementar notificações push
- [ ] Publicar na App Store (iOS)
- [ ] Publicar na Play Store (Android)

---

### 📅 Pós-Entrega — Contínuo
**Objetivo**: Refinamentos, otimizações e suporte.

- [ ] Implementar modo offline básico (mobile)
- [ ] Otimizar queries e performance do banco
- [ ] Implementar cache de dados frequentes
- [ ] Realizar testes de usabilidade
- [ ] Ajustes de UX baseados em feedback
- [ ] Documentação técnica e de usuário
- [ ] Treinamento de usuários

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| **Unidade** | Estacionamento/garagem física da rede |
| **Chamado** | Solicitação ou demanda registrada no sistema |
| **Checklist** | Lista de verificação com itens a serem conferidos |
| **Cobertura** | Conjunto de unidades sob responsabilidade de um supervisor |
| **RBAC** | Role-Based Access Control - Controle de acesso baseado em funções |
| **Não-conformidade** | Item do checklist marcado como "Não" |

---

## 11. Anexos

### A. Wireframes
*A serem desenvolvidos na fase de design*

### B. Especificações de API
*A serem desenvolvidas na fase técnica*

### C. Casos de Uso Detalhados
*A serem expandidos conforme necessidade*

---

**Documento criado em**: Dezembro/2025  
**Versão**: 1.0  
**Autor**: Equipe de Produto  
**Status**: Em revisão

