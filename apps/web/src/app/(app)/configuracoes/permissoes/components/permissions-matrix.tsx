'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Check, Globe, Minus, Shield } from 'lucide-react'
import type { Permission } from '@/lib/auth/permissions'
import type { RoleWithPermissions, PermissionGroup } from '../constants'
import { PERMISSION_LABELS } from '../constants'

interface PermissionsMatrixProps {
  roles: RoleWithPermissions[]
  permissionGroups: PermissionGroup[]
  showDepartment?: boolean
}

export function PermissionsMatrix({
  roles,
  permissionGroups,
  showDepartment = true,
}: PermissionsMatrixProps) {
  // Verifica se um cargo tem uma permissão específica
  const hasPermission = (role: RoleWithPermissions, permission: Permission): boolean => {
    // admin:all dá acesso a tudo
    if (role.permissions.includes('admin:all')) {
      return true
    }
    return role.permissions.includes(permission)
  }

  // Verifica se a permissão é herdada de admin:all
  const isInheritedFromAdmin = (role: RoleWithPermissions, permission: Permission): boolean => {
    return role.permissions.includes('admin:all') && permission !== 'admin:all'
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cargo encontrado</h3>
          <p className="text-muted-foreground text-center">
            Selecione outro filtro para visualizar os cargos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {permissionGroups.map((group) => (
          <Card key={group.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-muted/50 z-10">
                        Cargo
                      </TableHead>
                      {showDepartment && (
                        <TableHead className="w-[150px] min-w-[150px]">
                          Departamento
                        </TableHead>
                      )}
                      {group.permissions.map((permission) => (
                        <TableHead
                          key={permission}
                          className="text-center w-[100px] min-w-[100px]"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {PERMISSION_LABELS[permission]}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{permission}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            {role.is_global && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Globe className="h-4 w-4 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>Cargo Global</TooltipContent>
                              </Tooltip>
                            )}
                            <span>{role.name}</span>
                            {role.permissions.includes('admin:all') && (
                              <Badge variant="destructive" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {showDepartment && (
                          <TableCell className="text-muted-foreground">
                            {role.department_name || (
                              <span className="italic">Global</span>
                            )}
                          </TableCell>
                        )}
                        {group.permissions.map((permission) => {
                          const has = hasPermission(role, permission)
                          const inherited = isInheritedFromAdmin(role, permission)

                          return (
                            <TableCell
                              key={`${role.id}-${permission}`}
                              className="text-center"
                            >
                              {has ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex justify-center">
                                      <div
                                        className={cn(
                                          'h-6 w-6 rounded-full flex items-center justify-center',
                                          inherited
                                            ? 'bg-amber-100 dark:bg-amber-900/30'
                                            : 'bg-green-100 dark:bg-green-900/30'
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            'h-4 w-4',
                                            inherited
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-green-600 dark:text-green-400'
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {inherited
                                      ? 'Herdado de admin:all'
                                      : 'Permissão concedida'}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-muted/50">
                                    <Minus className="h-4 w-4 text-muted-foreground/50" />
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
