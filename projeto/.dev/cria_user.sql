-- Insere um novo perfil de usuário administrador no banco
INSERT INTO public.profiles (id, full_name, email, status)
VALUES ('{USER_ID}', 'Administrador GAPP', 'admin@garageinn.com.br', 'active');

-- Relaciona o usuário criado acima ao papel de Administrador global
INSERT INTO public.user_roles (user_id, role_id)
SELECT '{USER_ID}', id FROM public.roles WHERE name = 'Administrador' AND is_global = true;