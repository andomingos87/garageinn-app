'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import type { Department, TicketCategory } from '../actions'
import { CategoryTable } from './category-table'

interface DepartmentTabsProps {
  departments: Department[]
  categories: TicketCategory[]
  selectedDepartment: string | null
  onDepartmentChange: (departmentId: string) => void
  onEditCategory: (category: TicketCategory) => void
  onToggleStatus: (categoryId: string) => void
  onDeleteCategory: (categoryId: string) => void
  isLoading?: boolean
}

export function DepartmentTabs({
  departments,
  categories,
  selectedDepartment,
  onDepartmentChange,
  onEditCategory,
  onToggleStatus,
  onDeleteCategory,
  isLoading,
}: DepartmentTabsProps) {
  // Filtrar departamentos que têm categorias ou são relevantes
  const departmentsWithCategories = departments.filter(
    (d) => d.categories_count > 0 || categories.some((c) => c.department_id === d.id)
  )

  // Se não há departamentos, mostrar todos
  const displayDepartments = departmentsWithCategories.length > 0 ? departmentsWithCategories : departments

  // Valor padrão para a tab
  const defaultValue = selectedDepartment || displayDepartments[0]?.id || 'all'

  return (
    <Tabs
      value={selectedDepartment || defaultValue}
      onValueChange={onDepartmentChange}
      className="space-y-4"
    >
      <TabsList className="flex flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="all" className="gap-2">
          <Building2 className="h-4 w-4" />
          Todos
          <Badge variant="secondary" className="ml-1">
            {categories.length}
          </Badge>
        </TabsTrigger>
        {displayDepartments.map((dept) => {
          const deptCategories = categories.filter((c) => c.department_id === dept.id)
          return (
            <TabsTrigger key={dept.id} value={dept.id} className="gap-2">
              {dept.name}
              <Badge variant="secondary" className="ml-1">
                {deptCategories.length}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <CategoryTable
          categories={categories}
          onEdit={onEditCategory}
          onToggleStatus={onToggleStatus}
          onDelete={onDeleteCategory}
          showDepartment
          isLoading={isLoading}
        />
      </TabsContent>

      {displayDepartments.map((dept) => {
        const deptCategories = categories.filter((c) => c.department_id === dept.id)
        return (
          <TabsContent key={dept.id} value={dept.id} className="mt-4">
            <CategoryTable
              categories={deptCategories}
              onEdit={onEditCategory}
              onToggleStatus={onToggleStatus}
              onDelete={onDeleteCategory}
              showDepartment={false}
              isLoading={isLoading}
              emptyMessage={`Nenhuma categoria cadastrada para ${dept.name}`}
            />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

