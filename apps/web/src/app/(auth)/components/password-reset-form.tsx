"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "../recuperar-senha/actions";
import { useActionState } from "react";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: undefined as string | undefined,
  success: undefined as boolean | undefined,
};

export function PasswordResetForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await requestPasswordReset(formData);
      return { error: result.error, success: result.success };
    },
    initialState
  );

  // Show success message after submission
  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 text-sm bg-success/10 rounded-md border border-success/20">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-success">Email enviado!</p>
            <p className="text-muted-foreground">
              Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
              Verifique também a pasta de spam.
            </p>
          </div>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full h-11">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Error message */}
      {state.error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          required
          disabled={isPending}
          className="h-11"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar link de recuperação"
        )}
      </Button>

      {/* Back to login */}
      <Link href="/login">
        <Button variant="ghost" className="w-full h-11 mt-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o login
        </Button>
      </Link>
    </form>
  );
}

