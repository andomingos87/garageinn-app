"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function NewPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isSubscribed = true;

    // Escutar eventos de autenticação - abordagem recomendada pelo Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;

        console.log("Auth event:", event);

        if (event === "PASSWORD_RECOVERY") {
          // Sessão estabelecida via link de recuperação
          // Limpar hash da URL por segurança
          window.history.replaceState(null, "", window.location.pathname);
          setSessionReady(true);
          setIsProcessingToken(false);
        } else if (event === "SIGNED_IN" && session) {
          // Fallback: usuário já estava logado ou sessão restaurada
          setSessionReady(true);
          setIsProcessingToken(false);
        } else if (event === "TOKEN_REFRESHED" && session) {
          // Token foi atualizado, sessão válida
          setSessionReady(true);
          setIsProcessingToken(false);
        }
      }
    );

    // Verificar se já existe sessão (usuário acessou diretamente ou hash já foi processado)
    const checkExistingSession = async () => {
      // Dar tempo para o Supabase processar o hash automaticamente
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!isSubscribed) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionReady(true);
        setIsProcessingToken(false);
        // Limpar hash se ainda existir
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }

      // Se não há sessão e não há hash, mostrar erro
      const hash = window.location.hash;
      if (!hash || hash.length <= 1) {
        setTokenError("Link inválido ou expirado. Solicite um novo link de redefinição de senha.");
        setIsProcessingToken(false);
        return;
      }

      // Se há hash mas sessão não foi estabelecida após timeout, tentar processamento manual
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setError) {
            console.error("Erro ao definir sessão:", setError);
            setTokenError("Link expirado ou inválido. Solicite um novo link de redefinição.");
            setIsProcessingToken(false);
            return;
          }

          // Sessão estabelecida com sucesso
          window.history.replaceState(null, "", window.location.pathname);
          setSessionReady(true);
          setIsProcessingToken(false);
        } catch (err) {
          console.error("Erro ao processar token:", err);
          setTokenError("Ocorreu um erro inesperado. Tente novamente.");
          setIsProcessingToken(false);
        }
      } else {
        // Aguardar mais um pouco para o onAuthStateChange disparar
        setTimeout(() => {
          if (!isSubscribed) return;
          if (!sessionReady && isProcessingToken) {
            setTokenError("Não foi possível verificar o link. Solicite um novo link de redefinição.");
            setIsProcessingToken(false);
          }
        }, 3000);
      }
    };

    checkExistingSession();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [sessionReady, isProcessingToken]);

  // Handler para atualizar senha no cliente (não server action)
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validações
    if (!password || !confirmPassword) {
      setFormError("Todos os campos são obrigatórios");
      setIsPending(false);
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres");
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem");
      setIsPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.includes("should be different")) {
          setFormError("A nova senha deve ser diferente da anterior");
        } else if (error.message.includes("Auth session missing")) {
          setFormError("Sessão expirada. Solicite um novo link de redefinição.");
        } else {
          setFormError(error.message);
        }
        setIsPending(false);
        return;
      }

      // Sucesso! Redirecionar para login
      router.push("/login?message=password_updated");
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
      setIsPending(false);
    }
  }, [router]);

  // Mostrar loading enquanto processa o token
  if (isProcessingToken) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verificando link...</p>
      </div>
    );
  }

  // Mostrar erro se o token for inválido
  if (tokenError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{tokenError}</span>
        </div>
        <Button asChild className="w-full h-11">
          <a href="/esqueci-senha">Solicitar novo link</a>
        </Button>
      </div>
    );
  }

  // Mostrar sucesso da sessão estabelecida
  if (!sessionReady) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Sessão não estabelecida. Tente novamente.</p>
        <Button asChild className="w-full h-11">
          <a href="/esqueci-senha">Solicitar novo link</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success indicator */}
      <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Link verificado! Defina sua nova senha abaixo.</span>
      </div>

      {/* Error message */}
      {formError && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Password field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none">
          Nova senha
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={6}
            disabled={isPending}
            className="h-11 pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
      </div>

      {/* Confirm password field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
          Confirmar nova senha
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={6}
            disabled={isPending}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar nova senha"
        )}
      </Button>
    </form>
  );
}
