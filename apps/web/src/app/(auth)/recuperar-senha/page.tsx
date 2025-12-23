import { AuthCard } from "../components/auth-card";
import { PasswordResetForm } from "../components/password-reset-form";

export const metadata = {
  title: "Recuperar Senha | GAPP",
  description: "Recupere sua senha do GAPP",
};

export default function RecuperarSenhaPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe seu email para receber o link de recuperação"
    >
      <PasswordResetForm />
    </AuthCard>
  );
}

