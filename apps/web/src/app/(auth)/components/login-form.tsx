"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "../login/actions";
import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: undefined as string | undefined,
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await signIn(formData);
      return { error: result.error };
    },
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Focus on email field on mount
  useEffect(() => {
    const emailInput = formRef.current?.querySelector<HTMLInputElement>('input[name="email"]');
    emailInput?.focus();
  }, []);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium leading-none">
            Senha
          </label>
          <Link
            href="/recuperar-senha"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          minLength={6}
          disabled={isPending}
          className="h-11"
        />
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

