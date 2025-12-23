'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Check, X } from 'lucide-react'
import { updateUser, updateUserRoles } from '../../../actions'
import type { UserWithRoles, UserStatus } from '@/lib/supabase/database.types'

interface Department {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
  is_global: boolean | null
  department_id: string | null
}

interface UserEditFormProps {
  user: UserWithRoles
  departments: Department[]
  allRoles: Role[]
}

export function UserEditForm({ user, departments, allRoles }: UserEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState(user.full_name)
  const [phone, setPhone] = useState(user.phone || '')
  const [cpf, setCpf] = useState(user.cpf || '')
  const [status, setStatus] = useState<UserStatus>(user.status)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles.map((r) => r.role_id)
  )

  // Group roles by department
  const globalRoles = allRoles.filter((r) => r.is_global)
  const rolesByDepartment = allRoles
    .filter((r) => !r.is_global)
    .reduce((acc, role) => {
      const deptId = role.department_id || 'none'
      if (!acc[deptId]) acc[deptId] = []
      acc[deptId].push(role)
      return acc
    }, {} as Record<string, Role[]>)

  function toggleRole(roleId: string) {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  function formatPhone(value: string) {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  function formatCPF(value: string) {
    const digits = value.replace(/\D/g, '')
    
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        // Update user data
        const result = await updateUser(user.id, {
          full_name: fullName,
          phone: phone || null,
          cpf: cpf.replace(/\D/g, '') || null,
          status,
        })

        if (result.error) {
          setError(result.error)
          return
        }

        // Update roles
        const rolesResult = await updateUserRoles(user.id, selectedRoles)

        if (rolesResult.error) {
          setError(rolesResult.error)
          return
        }

        router.push(`/usuarios/${user.id}`)
      } catch (err) {
        setError('Erro ao salvar alterações')
        console.error(err)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Nome Completo *
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado por aqui.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefone
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cpf" className="text-sm font-medium">
              CPF
            </label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex gap-2">
            {(['active', 'pending', 'inactive'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={status === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus(s)}
                className={
                  status === s
                    ? s === 'active'
                      ? 'bg-success hover:bg-success/90'
                      : s === 'pending'
                      ? 'bg-warning hover:bg-warning/90'
                      : ''
                    : ''
                }
              >
                {s === 'active' ? 'Ativo' : s === 'pending' ? 'Pendente' : 'Inativo'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Roles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Cargos</h3>
          <p className="text-sm text-muted-foreground">
            Selecione os cargos que o usuário deve ter.
          </p>
        </div>

        {/* Global Roles */}
        {globalRoles.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Cargos Globais</p>
            <div className="flex flex-wrap gap-2">
              {globalRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant={selectedRoles.includes(role.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleRole(role.id)}
                >
                  {selectedRoles.includes(role.id) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Department Roles */}
        {departments.map((dept) => {
          const deptRoles = rolesByDepartment[dept.id] || []
          if (deptRoles.length === 0) return null

          return (
            <div key={dept.id}>
              <p className="text-sm font-medium mb-2">{dept.name}</p>
              <div className="flex flex-wrap gap-2">
                {deptRoles.map((role) => (
                  <Badge
                    key={role.id}
                    variant={selectedRoles.includes(role.id) ? 'secondary' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleRole(role.id)}
                  >
                    {selectedRoles.includes(role.id) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}

