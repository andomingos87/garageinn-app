'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail } from 'lucide-react'
import { updateUserEmail } from '../actions'

interface EditEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentEmail: string
  userName: string
  onSuccess?: () => void
}

export function EditEmailDialog({
  open,
  onOpenChange,
  userId,
  currentEmail,
  userName,
  onSuccess,
}: EditEmailDialogProps) {
  const [newEmail, setNewEmail] = useState(currentEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (newEmail === currentEmail) {
      setError('O novo email deve ser diferente do atual')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateUserEmail(userId, newEmail)
      
      if (result.error) {
        setError(result.error)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating email:', err)
      setError('Erro ao atualizar email')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setNewEmail(currentEmail)
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Editar Email
          </DialogTitle>
          <DialogDescription>
            Alterar o email do usuário <strong>{userName}</strong>.
            <br />
            <span className="text-xs text-muted-foreground">
              O usuário precisará usar o novo email para fazer login.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Email atual</Label>
            <Input
              id="current-email"
              value={currentEmail}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">Novo email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || newEmail === currentEmail}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Email'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

