'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, ShoppingCart, Wrench, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const TICKET_TYPES = [
  {
    id: 'compras',
    name: 'Compras',
    description: 'Solicitação de materiais, equipamentos e compras em geral',
    icon: ShoppingCart,
    href: '/chamados/compras/novo',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    hoverBg: 'hover:bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    description: 'Reparos, manutenção preventiva e corretiva',
    icon: Wrench,
    href: '/chamados/manutencao/novo',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    hoverBg: 'hover:bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'rh',
    name: 'RH',
    description: 'Solicitações relacionadas a recursos humanos',
    icon: Users,
    href: '/chamados/rh/novo',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverBg: 'hover:bg-green-50',
    borderColor: 'border-green-200',
  },
]

export function NewTicketDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Chamado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Chamado</DialogTitle>
          <DialogDescription>
            Selecione o tipo de chamado que deseja abrir
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {TICKET_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.href)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border text-left transition-colors',
                  type.borderColor,
                  type.hoverBg
                )}
              >
                <div className={cn('p-2 rounded-md', type.bgColor)}>
                  <Icon className={cn('h-5 w-5', type.color)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {type.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

