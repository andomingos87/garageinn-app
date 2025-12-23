import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Mail, Phone, Building2, Calendar } from "lucide-react";

export default function PerfilPage() {
  // Placeholder data - will be replaced with actual user data
  const user = {
    nome: "João Silva",
    email: "joao.silva@garageinn.com.br",
    telefone: "(11) 99999-9999",
    cpf: "***.***.***-12",
    departamentos: [{ nome: "Operações", cargo: "Encarregado" }],
    unidades: ["Centro"],
    dataCadastro: "15/01/2025",
    ultimoAcesso: "22/12/2025 às 08:30",
    avatar: null,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Visualize e edite suas informações
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.nome)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Alterar foto</span>
              </Button>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user.nome}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {user.departamentos.map((dept, i) => (
                  <Badge key={i} variant="secondary">
                    {dept.cargo} - {dept.nome}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados de Contato</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{user.telefone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Profissionais</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Unidade(s)</p>
                  <p className="font-medium">{user.unidades.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Cadastro
                  </p>
                  <p className="font-medium">{user.dataCadastro}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Security Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Segurança</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>CPF: {user.cpf}</p>
              <p>Último acesso: {user.ultimoAcesso}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline">Alterar Telefone</Button>
            <Button variant="destructive">Sair</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
