'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'
import { UnitAssignmentDialog } from '../../components'

interface UnitAssignmentButtonProps {
  templateId: string
}

export function UnitAssignmentButton({ templateId }: UnitAssignmentButtonProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
        <Building2 className="mr-2 h-4 w-4" />
        Vincular
      </Button>

      <UnitAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templateId={templateId}
        onSuccess={handleSuccess}
      />
    </>
  )
}

