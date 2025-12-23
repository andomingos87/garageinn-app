'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageSquare, Send, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { addComment } from '../../actions'

interface Comment {
  id: string
  content: string
  is_internal: boolean
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface TicketCommentsProps {
  ticketId: string
  comments: Comment[]
  canManage: boolean
}

export function TicketComments({ ticketId, comments, canManage }: TicketCommentsProps) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    
    const formData = new FormData()
    formData.set('content', content)
    formData.set('is_internal', isInternal.toString())
    
    startTransition(async () => {
      const result = await addComment(ticketId, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Comentário adicionado')
        setContent('')
        setIsInternal(false)
      }
    })
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comentários
          {comments.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de Comentários */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentário ainda
          </p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`flex gap-3 p-3 rounded-lg ${
                  comment.is_internal 
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900' 
                    : 'bg-muted/30'
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.author?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.author?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.author?.full_name || 'Desconhecido'}
                      </span>
                      {comment.is_internal && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 text-amber-600 border-amber-300">
                          <Lock className="h-2.5 w-2.5" />
                          Interno
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Formulário de Novo Comentário */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t">
          <Textarea
            placeholder="Escreva um comentário..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            {canManage && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_internal"
                  checked={isInternal}
                  onCheckedChange={(checked) => setIsInternal(checked === true)}
                />
                <label 
                  htmlFor="is_internal" 
                  className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Comentário interno (visível apenas para o departamento)
                </label>
              </div>
            )}
            
            <Button 
              type="submit" 
              size="sm" 
              disabled={isPending || !content.trim()}
              className="gap-2 ml-auto"
            >
              <Send className="h-4 w-4" />
              {isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

