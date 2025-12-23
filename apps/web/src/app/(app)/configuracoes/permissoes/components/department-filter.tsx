'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Building2, Globe } from 'lucide-react'

interface DepartmentFilterProps {
  departments: { id: string; name: string; rolesCount: number }[]
  globalRolesCount: number
  selectedDepartment: string | null
  onSelect: (departmentId: string | null) => void
}

export function DepartmentFilter({
  departments,
  globalRolesCount,
  selectedDepartment,
  onSelect,
}: DepartmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Todos */}
      <Button
        variant={selectedDepartment === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
        className="gap-2"
      >
        Todos
        <Badge variant="secondary" className={cn(
          'ml-1',
          selectedDepartment === null && 'bg-primary-foreground/20 text-primary-foreground'
        )}>
          {departments.reduce((sum, d) => sum + d.rolesCount, 0) + globalRolesCount}
        </Badge>
      </Button>

      {/* Cargos Globais */}
      <Button
        variant={selectedDepartment === 'global' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('global')}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        Globais
        <Badge variant="secondary" className={cn(
          'ml-1',
          selectedDepartment === 'global' && 'bg-primary-foreground/20 text-primary-foreground'
        )}>
          {globalRolesCount}
        </Badge>
      </Button>

      {/* Departamentos */}
      {departments.map((dept) => (
        <Button
          key={dept.id}
          variant={selectedDepartment === dept.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(dept.id)}
          className="gap-2"
        >
          <Building2 className="h-4 w-4" />
          {dept.name}
          <Badge variant="secondary" className={cn(
            'ml-1',
            selectedDepartment === dept.id && 'bg-primary-foreground/20 text-primary-foreground'
          )}>
            {dept.rolesCount}
          </Badge>
        </Button>
      ))}
    </div>
  )
}

