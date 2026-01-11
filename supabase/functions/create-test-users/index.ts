// Edge Function: create-test-users
// Cria usuários de teste para cada cargo de cada departamento
// Padrão de email: {cargo}_{setor}_teste@garageinn.com
// Senha padrão: Teste123!

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Definição dos usuários de teste
interface TestUser {
  email: string;
  full_name: string;
  role_name: string;
  department_name: string | null; // null para cargos globais
  unit_names?: string[]; // unidades para vincular
}

const TEST_USERS: TestUser[] = [
  // === CARGOS GLOBAIS (3) ===
  {
    email: "desenvolvedor_global_teste@garageinn.com",
    full_name: "Teste Desenvolvedor - Global",
    role_name: "Desenvolvedor",
    department_name: null,
  },
  {
    email: "diretor_global_teste@garageinn.com",
    full_name: "Teste Diretor - Global",
    role_name: "Diretor",
    department_name: null,
  },
  {
    email: "administrador_global_teste@garageinn.com",
    full_name: "Teste Administrador - Global",
    role_name: "Administrador",
    department_name: null,
  },

  // === OPERAÇÕES (4) ===
  {
    email: "manobrista_operacoes_teste@garageinn.com",
    full_name: "Teste Manobrista - Operações",
    role_name: "Manobrista",
    department_name: "Operações",
    unit_names: ["BERRINI ONE"],
  },
  {
    email: "encarregado_operacoes_teste@garageinn.com",
    full_name: "Teste Encarregado - Operações",
    role_name: "Encarregado",
    department_name: "Operações",
    unit_names: ["TOWER BRIDGE"],
  },
  {
    email: "supervisor_operacoes_teste@garageinn.com",
    full_name: "Teste Supervisor - Operações",
    role_name: "Supervisor",
    department_name: "Operações",
    unit_names: [
      "BERRINI ONE",
      "TOWER BRIDGE",
      "HEBRAICA",
      "CUBO",
      "MARIA CECILIA",
    ],
  },
  {
    email: "gerente_operacoes_teste@garageinn.com",
    full_name: "Teste Gerente - Operações",
    role_name: "Gerente",
    department_name: "Operações",
  },

  // === COMPRAS E MANUTENÇÃO (3) ===
  {
    email: "assistente_compras_e_manutencao_teste@garageinn.com",
    full_name: "Teste Assistente - Compras e Manutenção",
    role_name: "Assistente",
    department_name: "Compras e Manutenção",
  },
  {
    email: "comprador_compras_e_manutencao_teste@garageinn.com",
    full_name: "Teste Comprador - Compras e Manutenção",
    role_name: "Comprador",
    department_name: "Compras e Manutenção",
  },
  {
    email: "gerente_compras_e_manutencao_teste@garageinn.com",
    full_name: "Teste Gerente - Compras e Manutenção",
    role_name: "Gerente",
    department_name: "Compras e Manutenção",
  },

  // === FINANCEIRO (7) ===
  {
    email: "auxiliar_financeiro_teste@garageinn.com",
    full_name: "Teste Auxiliar - Financeiro",
    role_name: "Auxiliar",
    department_name: "Financeiro",
  },
  {
    email: "assistente_financeiro_teste@garageinn.com",
    full_name: "Teste Assistente - Financeiro",
    role_name: "Assistente",
    department_name: "Financeiro",
  },
  {
    email: "analista_junior_financeiro_teste@garageinn.com",
    full_name: "Teste Analista Júnior - Financeiro",
    role_name: "Analista Júnior",
    department_name: "Financeiro",
  },
  {
    email: "analista_pleno_financeiro_teste@garageinn.com",
    full_name: "Teste Analista Pleno - Financeiro",
    role_name: "Analista Pleno",
    department_name: "Financeiro",
  },
  {
    email: "analista_senior_financeiro_teste@garageinn.com",
    full_name: "Teste Analista Sênior - Financeiro",
    role_name: "Analista Sênior",
    department_name: "Financeiro",
  },
  {
    email: "supervisor_financeiro_teste@garageinn.com",
    full_name: "Teste Supervisor - Financeiro",
    role_name: "Supervisor",
    department_name: "Financeiro",
  },
  {
    email: "gerente_financeiro_teste@garageinn.com",
    full_name: "Teste Gerente - Financeiro",
    role_name: "Gerente",
    department_name: "Financeiro",
  },

  // === RH (7) ===
  {
    email: "auxiliar_rh_teste@garageinn.com",
    full_name: "Teste Auxiliar - RH",
    role_name: "Auxiliar",
    department_name: "RH",
  },
  {
    email: "assistente_rh_teste@garageinn.com",
    full_name: "Teste Assistente - RH",
    role_name: "Assistente",
    department_name: "RH",
  },
  {
    email: "analista_junior_rh_teste@garageinn.com",
    full_name: "Teste Analista Júnior - RH",
    role_name: "Analista Júnior",
    department_name: "RH",
  },
  {
    email: "analista_pleno_rh_teste@garageinn.com",
    full_name: "Teste Analista Pleno - RH",
    role_name: "Analista Pleno",
    department_name: "RH",
  },
  {
    email: "analista_senior_rh_teste@garageinn.com",
    full_name: "Teste Analista Sênior - RH",
    role_name: "Analista Sênior",
    department_name: "RH",
  },
  {
    email: "supervisor_rh_teste@garageinn.com",
    full_name: "Teste Supervisor - RH",
    role_name: "Supervisor",
    department_name: "RH",
  },
  {
    email: "gerente_rh_teste@garageinn.com",
    full_name: "Teste Gerente - RH",
    role_name: "Gerente",
    department_name: "RH",
  },

  // === SINISTROS (2) ===
  {
    email: "supervisor_sinistros_teste@garageinn.com",
    full_name: "Teste Supervisor - Sinistros",
    role_name: "Supervisor",
    department_name: "Sinistros",
  },
  {
    email: "gerente_sinistros_teste@garageinn.com",
    full_name: "Teste Gerente - Sinistros",
    role_name: "Gerente",
    department_name: "Sinistros",
  },

  // === COMERCIAL (1) ===
  {
    email: "gerente_comercial_teste@garageinn.com",
    full_name: "Teste Gerente - Comercial",
    role_name: "Gerente",
    department_name: "Comercial",
  },

  // === AUDITORIA (2) ===
  {
    email: "auditor_auditoria_teste@garageinn.com",
    full_name: "Teste Auditor - Auditoria",
    role_name: "Auditor",
    department_name: "Auditoria",
  },
  {
    email: "gerente_auditoria_teste@garageinn.com",
    full_name: "Teste Gerente - Auditoria",
    role_name: "Gerente",
    department_name: "Auditoria",
  },

  // === TI (2) ===
  {
    email: "analista_ti_teste@garageinn.com",
    full_name: "Teste Analista - TI",
    role_name: "Analista",
    department_name: "TI",
  },
  {
    email: "gerente_ti_teste@garageinn.com",
    full_name: "Teste Gerente - TI",
    role_name: "Gerente",
    department_name: "TI",
  },
];

const DEFAULT_PASSWORD = "Teste123!";
const SECRET_KEY = "garageinn-test-2026";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar secret key
    const body = await req.json().catch(() => ({}));
    if (body.secret_key !== SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Invalid secret key" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Buscar todos os cargos com departamentos
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("roles")
      .select("id, name, department_id, is_global, departments(name)");

    if (rolesError) {
      throw new Error(`Erro ao buscar cargos: ${rolesError.message}`);
    }

    // Buscar todas as unidades
    const { data: units, error: unitsError } = await supabaseAdmin
      .from("units")
      .select("id, name");

    if (unitsError) {
      throw new Error(`Erro ao buscar unidades: ${unitsError.message}`);
    }

    // Criar mapa de unidades por nome
    const unitMap = new Map(units.map((u: { id: string; name: string }) => [u.name, u.id]));

    // Criar mapa de cargos
    const roleMap = new Map<string, string>();
    for (const role of roles) {
      const deptName = role.is_global
        ? null
        : (role.departments as { name: string } | null)?.name;
      const key = `${role.name}|${deptName}`;
      roleMap.set(key, role.id);
    }

    const results: {
      email: string;
      status: string;
      error?: string;
    }[] = [];

    // Processar cada usuário
    for (const testUser of TEST_USERS) {
      try {
        // Verificar se usuário já existe
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", testUser.email)
          .single();

        if (existingProfile) {
          results.push({
            email: testUser.email,
            status: "skipped",
            error: "Usuário já existe",
          });
          continue;
        }

        // Criar usuário no Auth
        const { data: authUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: testUser.full_name,
            },
          });

        if (authError) {
          results.push({
            email: testUser.email,
            status: "error",
            error: `Auth: ${authError.message}`,
          });
          continue;
        }

        const userId = authUser.user.id;

        // Criar perfil
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: userId,
            email: testUser.email,
            full_name: testUser.full_name,
            status: "active",
          });

        if (profileError) {
          results.push({
            email: testUser.email,
            status: "error",
            error: `Profile: ${profileError.message}`,
          });
          continue;
        }

        // Buscar role_id
        const roleKey = `${testUser.role_name}|${testUser.department_name}`;
        const roleId = roleMap.get(roleKey);

        if (!roleId) {
          results.push({
            email: testUser.email,
            status: "error",
            error: `Cargo não encontrado: ${testUser.role_name} - ${testUser.department_name}`,
          });
          continue;
        }

        // Vincular cargo
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role_id: roleId,
          });

        if (roleError) {
          results.push({
            email: testUser.email,
            status: "error",
            error: `Role: ${roleError.message}`,
          });
          continue;
        }

        // Vincular unidades (se houver)
        if (testUser.unit_names && testUser.unit_names.length > 0) {
          const unitInserts = testUser.unit_names
            .map((unitName) => {
              const unitId = unitMap.get(unitName);
              if (!unitId) {
                console.warn(`Unidade não encontrada: ${unitName}`);
                return null;
              }
              return {
                user_id: userId,
                unit_id: unitId,
                is_coverage: false,
              };
            })
            .filter(Boolean);

          if (unitInserts.length > 0) {
            const { error: unitError } = await supabaseAdmin
              .from("user_units")
              .insert(unitInserts);

            if (unitError) {
              console.warn(
                `Erro ao vincular unidades para ${testUser.email}: ${unitError.message}`
              );
            }
          }
        }

        results.push({
          email: testUser.email,
          status: "created",
        });
      } catch (err) {
        results.push({
          email: testUser.email,
          status: "error",
          error: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }
    }

    // Resumo
    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errors = results.filter((r) => r.status === "error").length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: TEST_USERS.length,
          created,
          skipped,
          errors,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
