'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserCog, Loader2, AlertTriangle } from 'lucide-react'
import { impersonateUser } from '@/lib/services/impersonation-service'
import { toast } from 'sonner'

interface ImpersonateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userEmail: string
  currentUserId: string
}

export function ImpersonateDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  currentUserId,
}: ImpersonateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleImpersonate() {
    setIsLoading(true)
    try {
      const result = await impersonateUser(userId, currentUserId)
      toast.success(`Entrando como ${userName}...`)
      // Redirecionar para o magic link
      window.location.href = result.link
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao personificar usuário')
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Personificar Usuário
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Você está prestes a entrar na sessão de:
              </p>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-medium text-foreground">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Atenção</p>
                  <p className="mt-1">
                    Isso permite visualizar o sistema como este usuário para fins de suporte.
                    Um banner será exibido indicando que você está em modo de personificação.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleImpersonate} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <UserCog className="mr-2 h-4 w-4" />
                Entrar como usuário
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

