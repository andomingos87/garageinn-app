'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Phone, LogOut, Camera } from 'lucide-react'
import { updatePhone } from '../actions'
import { useAuth } from '@/hooks/use-auth'
import { AvatarUpload } from './avatar-upload'

interface ProfileActionsProps {
  currentPhone: string | null
  currentAvatarUrl: string | null
  userName: string
}

// Lazy load do Dialog
function PhoneDialog({
  currentPhone,
  open,
  onOpenChange,
}: {
  currentPhone: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [phone, setPhone] = useState(currentPhone || '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const result = await updatePhone(phone)
        if (result.error) {
          setError(result.error)
        } else {
          onOpenChange(false)
        }
      } catch {
        setError('Erro ao atualizar telefone')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Telefone</DialogTitle>
          <DialogDescription>
            Atualize seu número de telefone para contato.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProfileActions({ currentPhone, currentAvatarUrl, userName }: ProfileActionsProps) {
  const router = useRouter()
  const { signOut } = useAuth()
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setAvatarDialogOpen(true)}
        >
          <Camera className="mr-2 h-4 w-4" />
          Alterar Foto
        </Button>
        <Button
          variant="outline"
          onClick={() => setPhoneDialogOpen(true)}
        >
          <Phone className="mr-2 h-4 w-4" />
          Alterar Telefone
        </Button>
        <Button
          variant="destructive"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sair
        </Button>
      </div>

      <PhoneDialog
        currentPhone={currentPhone}
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
      />

      <AvatarUpload
        currentAvatarUrl={currentAvatarUrl}
        userName={userName}
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
      />
    </>
  )
}

