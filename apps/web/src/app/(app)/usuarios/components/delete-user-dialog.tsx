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
import { Loader2, AlertTriangle } from 'lucide-react'
import { softDeleteUser } from '../actions'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess?: () => void
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsLoading(true)
    setError(null)

    try {
      const result = await softDeleteUser(userId)
      
      if (result.error) {
        setError(result.error)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Erro ao excluir usuário')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir Usuário
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está prestes a excluir o usuário <strong>{userName}</strong>.
            </p>
            <p>
              Esta ação irá:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Desativar o acesso do usuário ao sistema</li>
              <li>Remover todos os vínculos com unidades</li>
              <li>Remover todos os cargos atribuídos</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              O usuário não será removido permanentemente e poderá ser restaurado posteriormente.
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
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir Usuário'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

