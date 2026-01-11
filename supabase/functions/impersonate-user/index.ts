/**
 * Edge Function: impersonate-user
 * 
 * Permite que administradores personifiquem outros usuários para fins de suporte.
 * Gera um magic link para o usuário alvo e registra a ação para auditoria.
 * 
 * Requisitos:
 * - Usuário chamador deve estar autenticado
 * - Usuário chamador deve ter role de Administrador ou Desenvolvedor (global)
 * - Não é permitido impersonar a si mesmo
 * - Não é permitido impersonar outros administradores
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Roles que podem impersonar outros usuários
const ALLOWED_IMPERSONATOR_ROLES = ["Administrador", "Desenvolvedor"];

// Roles que NÃO podem ser impersonados (proteção)
const PROTECTED_ROLES = ["Administrador", "Desenvolvedor"];

interface ImpersonateRequest {
  targetUserId: string;
}

interface ImpersonateResponse {
  link: string;
  targetUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface ErrorResponse {
  error: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Apenas POST é permitido
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Obter token de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Token de autorização não fornecido" } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Criar cliente Supabase com service role para operações admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verificar usuário autenticado usando o token JWT diretamente
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obter body da requisição
    const body: ImpersonateRequest = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "ID do usuário alvo não fornecido" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Não permitir impersonar a si mesmo
    if (targetUserId === callerUser.id) {
      return new Response(
        JSON.stringify({ error: "Você não pode personificar a si mesmo" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário chamador tem permissão para impersonar
    const { data: callerRoles, error: callerRolesError } = await supabaseAdmin
      .from("user_roles")
      .select(`
        role:roles(
          name,
          is_global
        )
      `)
      .eq("user_id", callerUser.id);

    if (callerRolesError) {
      console.error("Erro ao buscar roles do chamador:", callerRolesError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar permissões" } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se tem role permitida E é global
    const hasPermission = callerRoles?.some((ur) => {
      const role = ur.role as { name: string; is_global: boolean } | null;
      return role && ALLOWED_IMPERSONATOR_ROLES.includes(role.name) && role.is_global;
    });

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ 
          error: "Você não tem permissão para personificar usuários. Apenas Administradores e Desenvolvedores globais podem usar esta funcionalidade." 
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar dados do usuário alvo
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, status")
      .eq("id", targetUserId)
      .single();

    if (targetProfileError || !targetProfile) {
      return new Response(
        JSON.stringify({ error: "Usuário alvo não encontrado" } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário alvo está ativo
    if (targetProfile.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Não é possível personificar um usuário inativo" } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário alvo é um admin/dev (proteção)
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select(`
        role:roles(
          name,
          is_global
        )
      `)
      .eq("user_id", targetUserId);

    const isTargetProtected = targetRoles?.some((ur) => {
      const role = ur.role as { name: string; is_global: boolean } | null;
      return role && PROTECTED_ROLES.includes(role.name) && role.is_global;
    });

    if (isTargetProtected) {
      return new Response(
        JSON.stringify({ 
          error: "Não é permitido personificar outros Administradores ou Desenvolvedores" 
        } as ErrorResponse),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Gerar magic link para o usuário alvo
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: targetProfile.email,
      options: {
        redirectTo: `${req.headers.get("origin") || supabaseUrl}/dashboard?impersonated=true`,
      },
    });

    if (magicLinkError || !magicLinkData) {
      console.error("Erro ao gerar magic link:", magicLinkError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar link de acesso" } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Registrar ação de impersonação para auditoria
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: callerUser.id,
        action: "impersonate_user",
        resource_type: "user",
        resource_id: targetUserId,
        details: {
          target_email: targetProfile.email,
          target_name: targetProfile.full_name,
          caller_email: callerUser.email,
          timestamp: new Date().toISOString(),
        },
      });

    // Log de auditoria é opcional - não falhar se não existir a tabela
    if (auditError) {
      console.warn("Aviso: Não foi possível registrar auditoria:", auditError.message);
    }

    // Retornar resposta de sucesso
    const response: ImpersonateResponse = {
      link: magicLinkData.properties.action_link,
      targetUser: {
        id: targetProfile.id,
        name: targetProfile.full_name,
        email: targetProfile.email,
      },
    };

    console.log(`Impersonação iniciada: ${callerUser.email} -> ${targetProfile.email}`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na função impersonate-user:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
