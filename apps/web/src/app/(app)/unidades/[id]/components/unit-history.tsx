'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { History, ArrowRight } from 'lucide-react'
import type { UnitHistoryEntry } from '../../actions'

interface UnitHistoryCardProps {
  history: UnitHistoryEntry[]
}

export function UnitHistoryCard({ history }: UnitHistoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }
  
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'unit.insert': return 'Criação'
      case 'unit.update': return 'Alteração'
      case 'unit.delete': return 'Exclusão'
      default: return action
    }
  }
  
  const getActionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (action) {
      case 'unit.insert': return 'default'
      case 'unit.update': return 'secondary'
      case 'unit.delete': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Alterações
        </CardTitle>
        <CardDescription>
          {history.length > 0 
            ? `Últimas ${history.length} alteração${history.length !== 1 ? 'ões' : ''} nesta unidade`
            : 'Registro de alterações desta unidade'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma alteração registrada
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Alterações futuras serão exibidas aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user_avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(entry.user_name || 'S')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{entry.user_name}</p>
                    <Badge variant={getActionVariant(entry.action)} className="text-xs shrink-0">
                      {getActionLabel(entry.action)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>
                  {entry.changes.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {entry.changes.map((change, idx) => (
                        <div key={idx} className="text-xs flex items-start gap-1.5 text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          <span className="font-medium text-foreground shrink-0">{change.field}:</span>
                          {change.old_value && (
                            <>
                              <span className="line-through truncate max-w-[120px]" title={change.old_value}>
                                {change.old_value}
                              </span>
                              <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />
                            </>
                          )}
                          <span className="text-foreground truncate" title={change.new_value || undefined}>
                            {change.new_value || '(vazio)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

