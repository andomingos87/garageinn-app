import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

export default function ChecklistsPage() {
  // Placeholder data
  const checklists = [
    {
      id: 1,
      unidade: "Unidade Centro",
      tipo: "Abertura",
      data: "22/12/2025",
      status: "Concluído",
      executadoPor: "João Silva",
      horaExecucao: "06:45",
    },
    {
      id: 2,
      unidade: "Unidade Shopping Norte",
      tipo: "Abertura",
      data: "22/12/2025",
      status: "Pendente",
      executadoPor: null,
      horaExecucao: null,
    },
    {
      id: 3,
      unidade: "Unidade Aeroporto",
      tipo: "Supervisão",
      data: "22/12/2025",
      status: "Em Execução",
      executadoPor: "Maria Santos",
      horaExecucao: "10:30",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluído":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "em execução":
        return <PlayCircle className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "concluído":
        return "default";
      case "em execução":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">
            Checklists de abertura e supervisão das unidades
          </p>
        </div>
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar Checklist
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/15</div>
            <p className="text-xs text-muted-foreground">
              Checklists de abertura
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Supervisões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Agendadas hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklists List */}
      <Card>
        <CardHeader>
          <CardTitle>Checklists de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklists.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.unidade}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.tipo}{" "}
                      {item.horaExecucao && `• ${item.horaExecucao}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.executadoPor && (
                    <span className="text-sm text-muted-foreground">
                      {item.executadoPor}
                    </span>
                  )}
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
