import { AuthCard } from "../components/auth-card";
import { LoginForm } from "../components/login-form";

export const metadata = {
  title: "Entrar | GAPP",
  description: "Faça login no GAPP - Sistema de Gestão GarageInn",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar no GAPP"
      description="Digite suas credenciais para acessar o sistema"
    >
      <LoginForm />
    </AuthCard>
  );
}

