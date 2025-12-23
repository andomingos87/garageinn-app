'use client'

import { useState, useRef, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, Upload, X } from 'lucide-react'
import { uploadAvatar } from '../actions'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  open,
  onOpenChange,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.')
      return
    }

    // Validar tamanho (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 2MB.')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)
  }

  function handleRemovePreview() {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit() {
    if (!selectedFile) return

    setError(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('avatar', selectedFile)

        const result = await uploadAvatar(formData)

        if (result.error) {
          setError(result.error)
        } else {
          // Sucesso - fechar dialog e limpar estado
          handleRemovePreview()
          onOpenChange(false)
        }
      } catch {
        setError('Erro ao fazer upload da imagem')
      }
    })
  }

  function handleClose() {
    handleRemovePreview()
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          <DialogDescription>
            Escolha uma nova foto para seu perfil. Formatos aceitos: JPG, PNG ou WebP (máx. 2MB).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Preview Area */}
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={preview || currentAvatarUrl || undefined}
                alt={userName}
              />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            {preview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleRemovePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {!preview && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Button (when no preview) */}
          {!preview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Escolher Imagem
            </Button>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !selectedFile}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

