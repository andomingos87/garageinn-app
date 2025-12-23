'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GripVertical,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  ListChecks,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { QuestionFormDialog } from './question-form-dialog'
import { deleteQuestion, reorderQuestions, updateQuestion } from '../actions'
import type { Database } from '@/lib/supabase/database.types'

type Question = Database['public']['Tables']['checklist_questions']['Row']

interface QuestionsListProps {
  questions: Question[]
  templateId: string
}

export function QuestionsList({ questions, templateId }: QuestionsListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [orderedQuestions, setOrderedQuestions] = useState(questions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(orderedQuestions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setOrderedQuestions(items)

    // Salvar nova ordem no servidor
    startTransition(async () => {
      await reorderQuestions(templateId, items.map((q) => q.id))
      router.refresh()
    })
  }

  const handleDelete = (questionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
      startTransition(async () => {
        const result = await deleteQuestion(questionId, templateId)
        if (result.error) {
          alert(result.error)
        } else {
          setOrderedQuestions((prev) => prev.filter((q) => q.id !== questionId))
          router.refresh()
        }
      })
    }
  }

  const handleToggleStatus = (question: Question) => {
    const newStatus = question.status === 'active' ? 'inactive' : 'active'
    startTransition(async () => {
      const formData = new FormData()
      formData.append('question_text', question.question_text)
      formData.append('is_required', String(question.is_required))
      formData.append('requires_observation_on_no', String(question.requires_observation_on_no))
      formData.append('status', newStatus)

      const result = await updateQuestion(question.id, templateId, formData)
      if (result.error) {
        alert(result.error)
      } else {
        setOrderedQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? { ...q, status: newStatus } : q))
        )
        router.refresh()
      }
    })
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingQuestion(null)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    router.refresh()
    // Recarregar lista
    setOrderedQuestions(questions)
  }

  if (orderedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ListChecks className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nenhuma pergunta cadastrada</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Adicione perguntas para compor o checklist.
        </p>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pergunta
        </Button>

        <QuestionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          templateId={templateId}
          question={editingQuestion}
          onSuccess={handleDialogSuccess}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Arraste para reordenar • {orderedQuestions.length} pergunta
          {orderedQuestions.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pergunta
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {orderedQuestions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                  isDragDisabled={isPending}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-start gap-3 p-4 rounded-lg border bg-card transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      } ${question.status === 'inactive' ? 'opacity-60' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">
                              <span className="text-muted-foreground mr-2">
                                {index + 1}.
                              </span>
                              {question.question_text}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {question.is_required && (
                                <Badge variant="secondary" className="text-xs">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Obrigatória
                                </Badge>
                              )}
                              {question.requires_observation_on_no && (
                                <Badge variant="outline" className="text-xs">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Obs. se &quot;Não&quot;
                                </Badge>
                              )}
                              {question.status === 'inactive' && (
                                <Badge variant="secondary" className="text-xs">
                                  Inativa
                                </Badge>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(question)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(question)}
                              >
                                <Power className="mr-2 h-4 w-4" />
                                {question.status === 'active' ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(question.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <QuestionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templateId={templateId}
        question={editingQuestion}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

