-- ============================================
-- Seed 005: Configurações do Sistema
-- GarageInn App - System Settings
-- ============================================

INSERT INTO public.system_settings (key, value, description) VALUES

-- Configurações de Email
('email_enabled', 'false', 'Habilita envio de emails pelo sistema'),
('email_from_name', '"GarageInn"', 'Nome do remetente dos emails'),
('email_from_address', '"noreply@garageinn.com.br"', 'Endereço de email do remetente'),

-- Configurações de Convite
('invitation_expiry_hours', '72', 'Horas até expiração do convite de usuário'),

-- Configurações de Chamados
('ticket_auto_close_days', '7', 'Dias para fechar automaticamente chamados resolvidos'),
('ticket_sla_low_hours', '72', 'SLA em horas para prioridade baixa'),
('ticket_sla_medium_hours', '48', 'SLA em horas para prioridade média'),
('ticket_sla_high_hours', '24', 'SLA em horas para prioridade alta'),
('ticket_sla_urgent_hours', '4', 'SLA em horas para prioridade urgente'),

-- Configurações de Checklist
('checklist_opening_required', 'true', 'Exige checklist de abertura diário'),
('checklist_opening_deadline_hour', '10', 'Hora limite para checklist de abertura'),

-- Configurações de Upload
('upload_max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB'),
('upload_allowed_extensions', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx"]', 'Extensões de arquivo permitidas'),

-- Configurações de Sessão
('session_timeout_minutes', '480', 'Timeout de sessão em minutos (8 horas)'),

-- Configurações de Notificação (para futuro)
('notifications_enabled', 'false', 'Habilita sistema de notificações'),
('notifications_webhook_url', 'null', 'URL do webhook para notificações (N8N)')

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT 
  key as configuracao,
  value as valor,
  description as descricao
FROM public.system_settings
ORDER BY key;
