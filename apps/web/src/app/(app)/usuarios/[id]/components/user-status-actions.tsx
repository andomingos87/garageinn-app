'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Loader2 } from 'lucide-react'
import { updateUserStatus } from '../../actions'
import type { UserStatus } from '@/lib/supabase/database.types'

interface UserStatusActionsProps {
  userId: string
  currentStatus: UserStatus
}

export function UserStatusActions({ userId, currentStatus }: UserStatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleStatusChange(newStatus: UserStatus) {
    setIsLoading(true)
    try {
      await updateUserStatus(userId, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
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

      {currentStatus === 'active' && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Usuário está ativo
        </p>
      )}
    </div>
  )
}

