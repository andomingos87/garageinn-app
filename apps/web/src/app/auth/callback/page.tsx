'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

/**
 * Client-side auth callback handler.
 * 
 * Handles multiple auth flows:
 * - PKCE flow: code in query params
 * - Implicit flow: tokens in URL hash fragment (used by magic links/impersonation)
 * - Password Recovery: token_hash in query params
 * 
 * The Supabase client automatically detects and processes tokens from the hash.
 */
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Check for error in query params
      const errorParam = searchParams.get('error')
      if (errorParam) {
        setError(searchParams.get('error_description') || errorParam)
        return
      }

      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const next = searchParams.get('next') || '/dashboard'

      try {
        // Handle PKCE flow with code
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error)
            setError(error.message)
            return
          }
          router.replace(next)
          return
        }

        // Handle token_hash flow (password recovery)
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as 'recovery' | 'magiclink' | 'signup' | 'invite' | 'email',
            token_hash: tokenHash,
          })
          if (error) {
            console.error('Token verification error:', error)
            setError(error.message)
            return
          }
          router.replace(next)
          return
        }

        // For implicit flow (tokens in hash), the Supabase client handles it automatically
        // Check if we already have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (session) {
          // Session established successfully
          router.replace(next)
          return
        }

        // No session yet, wait for onAuthStateChange to pick up the hash tokens
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event)
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            subscription.unsubscribe()
            router.replace(next)
          }
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          subscription.unsubscribe()
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              router.replace(next)
            } else {
              setError('Não foi possível estabelecer a sessão. Por favor, tente novamente.')
            }
          })
        }, 10000)

      } catch (err) {
        console.error('Callback error:', err)
        setError('Erro ao processar autenticação')
      }
    }

    handleCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">Erro de autenticação</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-primary hover:underline"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

