import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Users, UserCheck, Clock, UserX, AlertCircle, Send } from 'lucide-react'
import type { UsersStats } from '../actions'

interface ExtendedStats extends UsersStats {
  invitationPending?: number
  invitationExpired?: number
}

interface UserStatsCardsProps {
  stats: ExtendedStats
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  const hasInvitationStats = stats.invitationPending !== undefined || stats.invitationExpired !== undefined

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Usuários
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ativos
          </CardTitle>
          <UserCheck className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendentes
          </CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-warning">{stats.pending}</span>
            {hasInvitationStats && (stats.invitationExpired ?? 0) > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      {stats.invitationExpired}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stats.invitationExpired} convite(s) expirado(s)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {hasInvitationStats && (stats.invitationPending ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Send className="h-3 w-3" />
              {stats.invitationPending} aguardando aceite
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Inativos
          </CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
        </CardContent>
      </Card>
    </div>
  )
}

