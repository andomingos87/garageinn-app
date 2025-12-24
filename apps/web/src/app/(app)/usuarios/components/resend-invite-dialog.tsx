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
import { Loader2, Send } from 'lucide-react'
import { resendInvitation } from '../actions'

interface ResendInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userEmail: string
  onSuccess?: () => void
}

export function ResendInviteDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  onSuccess,
}: ResendInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setIsLoading(true)
    setError(null)

    try {
      const result = await resendInvitation(userId)
      
      if (result.error) {
        setError(result.error)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error resending invite:', err)
      setError('Erro ao reenviar convite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Reenviar Convite
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está prestes a reenviar o convite para <strong>{userName}</strong>.
            </p>
            <p className="text-sm">
              Um novo email de convite será enviado para:
            </p>
            <p className="text-sm font-medium bg-muted p-2 rounded">
              {userEmail}
            </p>
            <p className="text-sm text-muted-foreground">
              O convite anterior será invalidado e o novo terá validade de 7 dias.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResend}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Reenviar Convite
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

