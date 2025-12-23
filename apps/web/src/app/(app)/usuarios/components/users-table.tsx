'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, Eye, Pencil, UserCheck, UserX, Users } from 'lucide-react'
import { updateUserStatus } from '../actions'
import type { UserWithRoles, UserStatus } from '@/lib/supabase/database.types'

interface UsersTableProps {
  users: UserWithRoles[]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusConfig(status: UserStatus) {
  switch (status) {
    case 'active':
      return { label: 'Ativo', variant: 'default' as const, className: 'bg-success hover:bg-success/90' }
    case 'pending':
      return { label: 'Pendente', variant: 'secondary' as const, className: 'bg-warning hover:bg-warning/90 text-warning-foreground' }
    case 'inactive':
      return { label: 'Inativo', variant: 'outline' as const, className: '' }
    default:
      return { label: status, variant: 'outline' as const, className: '' }
  }
}

function formatRoles(roles: UserWithRoles['roles']) {
  if (roles.length === 0) return 'Sem cargo'

  // Agrupar por departamento
  const globalRoles = roles.filter(r => r.is_global)
  const deptRoles = roles.filter(r => !r.is_global)

  const parts: string[] = []

  if (globalRoles.length > 0) {
    parts.push(globalRoles.map(r => r.role_name).join(', '))
  }

  // Agrupar roles por departamento
  const byDept = deptRoles.reduce((acc, r) => {
    const dept = r.department_name || 'Sem departamento'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(r.role_name)
    return acc
  }, {} as Record<string, string[]>)

  for (const [dept, roleNames] of Object.entries(byDept)) {
    parts.push(`${roleNames.join(', ')} (${dept})`)
  }

  return parts.join(' · ')
}

function getDepartments(roles: UserWithRoles['roles']) {
  const departments = new Set<string>()
  
  for (const role of roles) {
    if (role.is_global) {
      departments.add('Global')
    } else if (role.department_name) {
      departments.add(role.department_name)
    }
  }

  return Array.from(departments)
}

export function UsersTable({ users }: UsersTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  async function handleStatusChange(userId: string, newStatus: UserStatus) {
    setLoadingUserId(userId)
    try {
      await updateUserStatus(userId, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoadingUserId(null)
    }
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste os filtros ou adicione um novo usuário.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead className="hidden md:table-cell">Departamento</TableHead>
          <TableHead className="hidden lg:table-cell">Cargo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const statusConfig = getStatusConfig(user.status)
          const departments = getDepartments(user.roles)
          const isLoading = loadingUserId === user.id

          return (
            <TableRow key={user.id} className="cursor-pointer group">
              <TableCell>
                <Link href={`/usuarios/${user.id}`} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <Badge key={dept} variant="outline" className="text-xs">
                        {dept}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatRoles(user.roles)}
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={statusConfig.variant}
                  className={statusConfig.className}
                >
                  {statusConfig.label}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/usuarios/${user.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/usuarios/${user.id}/editar`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status !== 'active' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-success"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {user.status !== 'inactive' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(user.id, 'inactive')}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

