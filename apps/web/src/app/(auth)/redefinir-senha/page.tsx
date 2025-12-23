import { AuthCard } from "../components/auth-card";
import { NewPasswordForm } from "../components/new-password-form";

export const metadata = {
  title: "Redefinir Senha | GAPP",
  description: "Defina sua nova senha do GAPP",
};

export default function RedefinirSenhaPage() {
  return (
    <AuthCard
      title="Redefinir senha"
      description="Digite sua nova senha abaixo"
    >
      <NewPasswordForm />
    </AuthCard>
  );
}

