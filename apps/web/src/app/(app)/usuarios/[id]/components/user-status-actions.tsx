'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Loader2, Send, Mail, Trash2 } from 'lucide-react'
import { updateUserStatus } from '../../actions'
import { DeleteUserDialog, EditEmailDialog, ResendInviteDialog } from '../../components'
import type { UserStatus, InvitationStatus } from '@/lib/supabase/database.types'

interface UserStatusActionsProps {
  userId: string
  userName: string
  userEmail: string
  currentStatus: UserStatus
  invitationStatus: InvitationStatus
}

type DialogType = 'delete' | 'edit-email' | 'resend-invite' | null

export function UserStatusActions({ 
  userId, 
  userName,
  userEmail,
  currentStatus,
  invitationStatus,
}: UserStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState<DialogType>(null)

  async function handleStatusChange(newStatus: UserStatus) {
    setIsLoading(true)
    try {
      await updateUserStatus(userId, newStatus)
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDialogSuccess() {
    router.refresh()
  }

  const canResendInvite = currentStatus === 'pending' && (invitationStatus === 'expired' || invitationStatus === 'pending')

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Ação de Reenviar Convite */}
        {canResendInvite && (
          <Button
            variant="outline"
            className="w-full justify-start text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            onClick={() => setOpenDialog('resend-invite')}
            disabled={isLoading}
          >
            <Send className="mr-2 h-4 w-4" />
            Reenviar Convite
          </Button>
        )}

        {/* Ação de Editar Email */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOpenDialog('edit-email')}
          disabled={isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Alterar Email
        </Button>

        {/* Ação de Ativar */}
        {currentStatus !== 'active' && (
          <Button
            variant="outline"
            className="w-full justify-start text-success hover:text-success hover:bg-success/10"
            onClick={() => handleStatusChange('active')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            Ativar Usuário
          </Button>
        )}

        {/* Ação de Desativar */}
        {currentStatus !== 'inactive' && (
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleStatusChange('inactive')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserX className="mr-2 h-4 w-4" />
            )}
            Desativar Usuário
          </Button>
        )}

        {/* Ação de Excluir */}
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setOpenDialog('delete')}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Usuário
        </Button>

        {currentStatus === 'active' && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Usuário está ativo
          </p>
        )}
      </div>

      {/* Dialogs */}
      <DeleteUserDialog
        open={openDialog === 'delete'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        userId={userId}
        userName={userName}
        onSuccess={handleDialogSuccess}
      />
      <EditEmailDialog
        open={openDialog === 'edit-email'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        userId={userId}
        currentEmail={userEmail}
        userName={userName}
        onSuccess={handleDialogSuccess}
      />
      <ResendInviteDialog
        open={openDialog === 'resend-invite'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        onSuccess={handleDialogSuccess}
      />
    </>
  )
}

