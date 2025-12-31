'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  MessageCircle, 
  Users,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { addClaimCommunication } from '../actions'
import { COMMUNICATION_CHANNELS } from '../../constants'

interface Communication {
  id: string
  communication_date: string
  channel: string
  summary: string
  next_contact_date: string | null
  created_at: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ClaimCommunicationsProps {
  ticketId: string
  communications: Communication[]
  canManage: boolean
}

const channelIcons: Record<string, React.ElementType> = {
  telefone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  presencial: Users,
  outro: MessageSquare,
}

const channelColors: Record<string, string> = {
  telefone: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  whatsapp: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  email: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  presencial: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  outro: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

export function ClaimCommunications({ ticketId, communications, canManage }: ClaimCommunicationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [channel, setChannel] = useState('')
  const [summary, setSummary] = useState('')
  const [nextContactDate, setNextContactDate] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
  const getChannelLabel = (channelValue: string) => {
    return COMMUNICATION_CHANNELS.find(c => c.value === channelValue)?.label || channelValue
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!channel || !summary.trim()) return
    
    const formData = new FormData()
    formData.set('channel', channel)
    formData.set('summary', summary)
    if (nextContactDate) {
      formData.set('next_contact_date', nextContactDate)
    }
    
    startTransition(async () => {
      const result = await addClaimCommunication(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Comunicação registrada com sucesso')
        setChannel('')
        setSummary('')
        setNextContactDate('')
        setIsDialogOpen(false)
      }
    })
  }
  
  // Ordenar por data mais recente
  const sortedCommunications = [...communications].sort(
    (a, b) => new Date(b.communication_date).getTime() - new Date(a.communication_date).getTime()
  )
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicações com Cliente
            {communications.length > 0 && (
              <Badge variant="secondary">
                {communications.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {canManage && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Registrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Comunicação</DialogTitle>
                    <DialogDescription>
                      Registre uma comunicação realizada com o cliente sobre este sinistro.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="channel">Canal de Comunicação *</Label>
                      <Select value={channel} onValueChange={setChannel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMUNICATION_CHANNELS.map((ch) => {
                            const Icon = channelIcons[ch.value] || MessageSquare
                            return (
                              <SelectItem key={ch.value} value={ch.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {ch.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="summary">Resumo da Comunicação *</Label>
                      <Textarea
                        id="summary"
                        placeholder="Descreva o que foi conversado com o cliente..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="next_contact_date">Próximo Contato (opcional)</Label>
                      <Input
                        id="next_contact_date"
                        type="date"
                        value={nextContactDate}
                        onChange={(e) => setNextContactDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isPending || !channel || !summary.trim()}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isPending ? 'Salvando...' : 'Registrar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
            {communications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {sortedCommunications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma comunicação registrada ainda
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sortedCommunications.map((comm) => {
                const Icon = channelIcons[comm.channel] || MessageSquare
                const colorClass = channelColors[comm.channel] || channelColors.outro
                
                return (
                  <div 
                    key={comm.id} 
                    className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full h-fit ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${colorClass}`}>
                            {getChannelLabel(comm.channel)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comm.communication_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(comm.communication_date), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                        {comm.summary}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={comm.creator?.avatar_url || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(comm.creator?.full_name || null)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {comm.creator?.full_name || 'Desconhecido'}
                          </span>
                        </div>
                        
                        {comm.next_contact_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Próximo: {format(new Date(comm.next_contact_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

