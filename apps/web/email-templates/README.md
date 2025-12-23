# Email Templates - GarageInn GAPP

Templates de email em HTML para configurar no Supabase Auth.

## Como usar

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** → **Email Templates**
3. Cole o conteúdo do arquivo correspondente em cada template

## Templates disponíveis

| Template | Arquivo | Uso |
|----------|---------|-----|
| Confirm signup | `confirmation-email.html` | Email de confirmação/Magic Link para novos usuários |
| Reset password | `reset-password-email.html` | Email para redefinir senha |
| Change email address | `change-email.html` | Email para confirmar alteração de email |

## Variáveis do Supabase

Os templates usam as seguintes variáveis que o Supabase substitui automaticamente:

- `{{ .ConfirmationURL }}` — URL completa para confirmação
- `{{ .Email }}` — Email do destinatário
- `{{ .SiteURL }}` — URL base do site configurado
- `{{ .Token }}` — Token de confirmação (se necessário)
- `{{ .TokenHash }}` — Hash do token
- `{{ .RedirectTo }}` — URL de redirecionamento após ação

## Design System

Os templates seguem o design system do GAPP:

- **Cor primária**: `#f23d3d` (vermelho vibrante)
- **Fonte**: Inter, system-ui, sans-serif
- **Estilo**: Clean, funcional e profissional
- **Responsivo**: Funciona em desktop e mobile

## Notas

- Os templates usam CSS inline para máxima compatibilidade com clientes de email
- Testado com Gmail, Outlook e Apple Mail
- As imagens utilizam URLs absolutas (atualize para seu domínio de produção)

