'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Trash2, Globe, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '../actions'
import { deleteRole } from '../actions'

interface RolesListProps {
  roles: Role[]
  departmentId?: string | null
  onEdit: (role: Role) => void
}

export function RolesList({ roles, departmentId, onEdit }: RolesListProps) {
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!roleToDelete) return

    startTransition(async () => {
      const result = await deleteRole(roleToDelete.id, departmentId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cargo excluído com sucesso')
      }
      setRoleToDelete(null)
    })
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum cargo encontrado.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-[120px]">Tipo</TableHead>
            <TableHead className="w-[120px]">Usuários</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>
                {role.is_global ? (
                  <Badge variant="default" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Global
                  </Badge>
                ) : (
                  <Badge variant="secondary">Departamental</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {role.users_count}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(role)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setRoleToDelete(role)}
                      className="text-destructive focus:text-destructive"
                      disabled={role.users_count > 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cargo <strong>{roleToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

