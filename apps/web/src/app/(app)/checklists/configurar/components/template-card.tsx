'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
  ClipboardList,
  MoreVertical,
  Pencil,
  Eye,
  Trash2,
  Building2,
  ListChecks,
  Power,
} from 'lucide-react'
import type { TemplateWithDetails } from '../actions'

interface TemplateCardProps {
  template: TemplateWithDetails
  onDelete?: (templateId: string) => void
  onToggleStatus?: (templateId: string, newStatus: 'active' | 'inactive') => void
}

export function TemplateCard({ template, onDelete, onToggleStatus }: TemplateCardProps) {
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
      onDelete?.(template.id)
    }
  }

  const handleToggleStatus = () => {
    const newStatus = template.status === 'active' ? 'inactive' : 'active'
    onToggleStatus?.(template.id, newStatus)
  }

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/checklists/configurar/${template.id}`} className="flex-1 min-w-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{template.name}</span>
              </CardTitle>
              {template.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {template.description}
                </CardDescription>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
              {template.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/checklists/configurar/${template.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/checklists/configurar/${template.id}/editar`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/checklists/configurar/${template.id}/perguntas`}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Gerenciar Perguntas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                  <Power className="mr-2 h-4 w-4" />
                  {template.status === 'active' ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={`/checklists/configurar/${template.id}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="font-normal">
                {template.type === 'opening' ? 'Abertura' : 'Supervisão'}
              </Badge>
              {template.is_default && (
                <Badge variant="secondary" className="font-normal">
                  Padrão
                </Badge>
              )}
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{template.questions_count}</span>
            <span className="text-muted-foreground">
              pergunta{template.questions_count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              {template.units.length} unidade{template.units.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {template.units.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.units.slice(0, 3).map((unit) => (
              <span
                key={unit.id}
                className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground"
              >
                {unit.code}
              </span>
            ))}
            {template.units.length > 3 && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                +{template.units.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

