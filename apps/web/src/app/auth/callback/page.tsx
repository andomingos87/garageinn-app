'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

/**
 * Parse hash fragment into key-value pairs
 */
function parseHashFragment(hash: string): Record<string, string> {
  if (!hash || hash.length <= 1) return {}

  const params: Record<string, string> = {}
  const hashContent = hash.startsWith('#') ? hash.substring(1) : hash

  hashContent.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  })

  return params
}

/**
 * Client-side auth callback handler.
 *
 * Handles multiple auth flows:
 * - PKCE flow: code in query params
 * - Implicit flow: tokens in URL hash fragment (used by magic links/impersonation)
 * - Password Recovery: token_hash in query params
 *
 * IMPORTANT: Uses window.location.href for redirects to ensure cookies are
 * properly propagated via full page reload (required for server-side auth).
 */
function AuthCallbackContent() {
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

      // Helper to redirect with full page reload (ensures cookies are sent)
      const redirectTo = (path: string) => {
        window.location.href = path
      }

      try {
        // Handle PKCE flow with code
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error)
            setError(error.message)
            return
          }
          redirectTo(next)
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
          redirectTo(next)
          return
        }

        // Handle implicit flow - tokens in hash fragment (magic links/impersonation)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const hashParams = parseHashFragment(hash)
          const accessToken = hashParams['access_token']
          const refreshToken = hashParams['refresh_token']

          if (accessToken && refreshToken) {
            console.log('Processing tokens from hash fragment...')
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('Set session error:', error)
              setError(error.message)
              return
            }

            console.log('Session established successfully')
            redirectTo(next)
            return
          }
        }

        // Check if we already have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (session) {
          // Session established successfully
          redirectTo(next)
          return
        }

        // No session and no tokens - show error
        setError('Não foi possível estabelecer a sessão. Por favor, tente novamente.')

      } catch (err) {
        console.error('Callback error:', err)
        setError('Erro ao processar autenticação')
      }
    }

    handleCallback()
  }, [searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">Erro de autenticacao</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
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

