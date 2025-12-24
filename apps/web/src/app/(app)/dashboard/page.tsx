import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  MessageSquareMore,
  Building2,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Chamados Abertos
  const { count: openTicketsCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .not("status", "in", '("resolved","closed","cancelled")');

  // 2. Checklists Hoje
  const today = new Date().toISOString().split("T")[0];
  const { count: checklistsTodayCount } = await supabase
    .from("checklist_executions")
    .select("*", { count: "exact", head: true })
    .gte("started_at", today);

  const { count: totalExpectedChecklists } = await supabase
    .from("unit_checklist_templates")
    .select("*", { count: "exact", head: true });

  const checklistProgress = totalExpectedChecklists
    ? Math.round((Number(checklistsTodayCount) / Number(totalExpectedChecklists)) * 100)
    : 0;

  // 3. Unidades Ativas
  const { count: activeUnitsCount } = await supabase
    .from("units")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 4. Taxa de Resolução (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: resolutionData } = await supabase
    .from("tickets")
    .select("status")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const totalInPeriod = resolutionData?.length || 0;
  const resolvedInPeriod =
    resolutionData?.filter((t) => ["resolved", "closed"].includes(t.status))
      .length || 0;
  const resolutionRate =
    totalInPeriod > 0 ? Math.round((resolvedInPeriod / totalInPeriod) * 100) : 0;

  // 5. Chamados Recentes
  const { data: recentTicketsRaw } = await supabase
    .from("tickets_with_details")
    .select("ticket_number, title, status, department_name")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentTickets = recentTicketsRaw?.map((t) => ({
    id: `#${t.ticket_number}`,
    title: t.title,
    dept: t.department_name || "N/A",
    status:
      t.status === "quoting"
        ? "Em Cotação"
        : t.status === "in_progress"
        ? "Em Andamento"
        : t.status === "awaiting_triage"
        ? "Aguardando Triagem"
        : t.status,
  })) || [];

  // 6. Checklists Pendentes
  const { data: unitsWithTemplates } = await supabase.from("unit_checklist_templates")
    .select(`
      unit_id,
      units (name),
      checklist_templates (type)
    `);

  const { data: executionsToday } = await supabase
    .from("checklist_executions")
    .select("unit_id")
    .gte("started_at", today);

  const pendingChecklists =
    unitsWithTemplates
      ?.filter((uct) => !executionsToday?.some((e) => e.unit_id === uct.unit_id))
      .slice(0, 5)
      .map((uct: any) => ({
        unit: uct.units?.name || "Unidade Desconhecida",
        type: uct.checklist_templates?.type === "opening" ? "Abertura" : "Supervisão",
        time: "Pendente",
      })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo ao GAPP — Sistema de Gestão Operacional
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chamados Abertos
            </CardTitle>
            <MessageSquareMore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTicketsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total de pendências</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Checklists Hoje
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklistsTodayCount || 0}/{totalExpectedChecklists || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {checklistProgress}% das unidades concluíram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unidades Ativas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUnitsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Em operação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Resolução
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chamados Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.length > 0 ? (
                recentTickets.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.id} - {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.dept}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum chamado recente.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklists Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingChecklists.length > 0 ? (
                pendingChecklists.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <Badge variant="outline">{item.time}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum checklist pendente hoje.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

