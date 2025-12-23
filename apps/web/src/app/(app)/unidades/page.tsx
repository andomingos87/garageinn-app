import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Plus, Users } from "lucide-react";

export default function UnidadesPage() {
  // Placeholder data
  const unidades = [
    {
      id: 1,
      nome: "Unidade Centro",
      codigo: "UC001",
      endereco: "Rua das Flores, 123 - Centro",
      cidade: "São Paulo, SP",
      capacidade: 120,
      funcionarios: 8,
      status: "Ativa",
    },
    {
      id: 2,
      nome: "Unidade Shopping Norte",
      codigo: "USN002",
      endereco: "Av. Norte Sul, 456 - Shopping Norte",
      cidade: "São Paulo, SP",
      capacidade: 250,
      funcionarios: 12,
      status: "Ativa",
    },
    {
      id: 3,
      nome: "Unidade Aeroporto",
      codigo: "UA003",
      endereco: "Rod. Hélio Smidt, s/n",
      cidade: "Guarulhos, SP",
      capacidade: 500,
      funcionarios: 20,
      status: "Ativa",
    },
    {
      id: 4,
      nome: "Unidade Zona Sul",
      codigo: "UZS004",
      endereco: "Av. Santo Amaro, 789",
      cidade: "São Paulo, SP",
      capacidade: 80,
      funcionarios: 5,
      status: "Inativa",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Unidades</h2>
          <p className="text-muted-foreground">
            Gerencie as unidades da rede Garageinn
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unidades.map((unidade) => (
          <Card
            key={unidade.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {unidade.nome}
                  </CardTitle>
                  <CardDescription>{unidade.codigo}</CardDescription>
                </div>
                <Badge
                  variant={unidade.status === "Ativa" ? "default" : "secondary"}
                >
                  {unidade.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p>{unidade.endereco}</p>
                  <p className="text-muted-foreground">{unidade.cidade}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{unidade.capacidade}</span>
                  <span className="text-muted-foreground">vagas</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{unidade.funcionarios} funcionários</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
