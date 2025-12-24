"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "../redefinir-senha/actions";
import { useActionState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const initialState = {
  error: undefined as string | undefined,
};

export function NewPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await updatePassword(formData);
      return { error: result.error };
    },
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const processHashToken = async () => {
      try {
        // Verificar se há hash na URL
        const hash = window.location.hash;
        
        if (!hash || hash.length <= 1) {
          // Verificar se já existe uma sessão válida
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setSessionReady(true);
            setIsProcessingToken(false);
            return;
          }
          
          setTokenError("Link inválido ou expirado. Solicite um novo link de redefinição de senha.");
          setIsProcessingToken(false);
          return;
        }

        // Parse dos parâmetros do hash
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Verificar se é um link de recovery
        if (type !== "recovery") {
          // Pode ser magiclink ou outro tipo, ainda assim tentar processar
          console.log("Token type:", type);
        }

        if (!accessToken) {
          setTokenError("Token de acesso não encontrado. Solicite um novo link.");
          setIsProcessingToken(false);
          return;
        }

        // Criar cliente Supabase e estabelecer sessão
        const supabase = createClient();
        
        // O Supabase SSR client deve processar automaticamente o hash
        // Mas vamos garantir chamando getSession que força o processamento
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao processar sessão:", error);
          setTokenError("Erro ao processar o link. Tente novamente ou solicite um novo link.");
          setIsProcessingToken(false);
          return;
        }

        if (!data.session) {
          // Tentar setSession manualmente se getSession não funcionou
          if (refreshToken) {
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
          } else {
            // Sem refresh token, tentar verificar o OTP
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: accessToken,
              type: "recovery",
            });

            if (verifyError) {
              console.error("Erro ao verificar OTP:", verifyError);
              setTokenError("Link expirado ou inválido. Solicite um novo link de redefinição.");
              setIsProcessingToken(false);
              return;
            }
          }
        }

        // Limpar o hash da URL para segurança
        window.history.replaceState(null, "", window.location.pathname);
        
        setSessionReady(true);
        setIsProcessingToken(false);
      } catch (err) {
        console.error("Erro ao processar token:", err);
        setTokenError("Ocorreu um erro inesperado. Tente novamente.");
        setIsProcessingToken(false);
      }
    };

    processHashToken();
  }, []);

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
    <form action={formAction} className="space-y-4">
      {/* Success indicator */}
      <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Link verificado! Defina sua nova senha abaixo.</span>
      </div>

      {/* Error message */}
      {state.error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
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
