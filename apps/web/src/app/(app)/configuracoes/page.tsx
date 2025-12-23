import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CheckSquare,
  MessageSquareMore,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const configSections = [
    {
      title: "Departamentos e Cargos",
      description: "Gerencie a estrutura organizacional",
      icon: Users,
      href: "/configuracoes/departamentos",
    },
    {
      title: "Unidades",
      description: "Configure unidades e coberturas",
      icon: Building2,
      href: "/configuracoes/unidades",
    },
    {
      title: "Checklists",
      description: "Configure templates de checklists",
      icon: CheckSquare,
      href: "/configuracoes/checklists",
    },
    {
      title: "Chamados",
      description: "Configure tipos e fluxos de chamados",
      icon: MessageSquareMore,
      href: "/configuracoes/chamados",
    },
    {
      title: "Permissões",
      description: "Gerencie permissões por cargo",
      icon: Shield,
      href: "/configuracoes/permissoes",
    },
    {
      title: "Sistema",
      description: "Configurações gerais do sistema",
      icon: Settings,
      href: "/configuracoes/sistema",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <Separator />

      {/* Config Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configSections.map((section) => (
          <Card
            key={section.href}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href={section.href}>Acessar →</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
