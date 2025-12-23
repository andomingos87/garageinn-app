import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function ChamadosPage() {
  // Placeholder data
  const chamados = [
    {
      id: "#1234",
      titulo: "Solicitação de materiais de limpeza",
      departamento: "Compras",
      unidade: "Centro",
      status: "Em Andamento",
      prioridade: "Média",
      criado: "20/12/2025",
    },
    {
      id: "#1233",
      titulo: "Reparo no portão automático",
      departamento: "Manutenção",
      unidade: "Shopping Norte",
      status: "Priorizado",
      prioridade: "Alta",
      criado: "19/12/2025",
    },
    {
      id: "#1232",
      titulo: "Uniformes para novos colaboradores",
      departamento: "RH",
      unidade: "Aeroporto",
      status: "Aguardando Triagem",
      prioridade: "Baixa",
      criado: "18/12/2025",
    },
    {
      id: "#1231",
      titulo: "Troca de lâmpadas LED",
      departamento: "Manutenção",
      unidade: "Centro",
      status: "Resolvido",
      prioridade: "Baixa",
      criado: "17/12/2025",
    },
  ];

  const getPriorityVariant = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case "alta":
      case "urgente":
        return "destructive";
      case "média":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Chamados</h2>
          <p className="text-muted-foreground">
            Gerencie chamados de todos os departamentos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* Chamados Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chamados.map((chamado) => (
                <TableRow key={chamado.id} className="cursor-pointer">
                  <TableCell className="font-medium">{chamado.id}</TableCell>
                  <TableCell>{chamado.titulo}</TableCell>
                  <TableCell>{chamado.departamento}</TableCell>
                  <TableCell>{chamado.unidade}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{chamado.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(chamado.prioridade)}>
                      {chamado.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {chamado.criado}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
