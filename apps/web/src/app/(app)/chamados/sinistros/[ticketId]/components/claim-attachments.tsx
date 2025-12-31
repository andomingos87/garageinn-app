'use client'

import { useState, useTransition, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Upload, 
  X, 
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  File,
  Camera,
  FileCheck,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Attachment {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  category?: string
  created_at: string
  uploader: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ClaimAttachmentsProps {
  ticketId: string
  attachments: Attachment[]
  canManage: boolean
  onUpload?: (files: FileList) => Promise<{ error?: string }>
}

const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'damage_photos': { label: 'Fotos do Dano', icon: Camera, color: 'bg-red-100 text-red-700 border-red-200' },
  'ticket': { label: 'Ticket', icon: FileCheck, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'documents': { label: 'Documentos', icon: FileText, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'other': { label: 'Outros', icon: File, color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/')
}

export function ClaimAttachments({ ticketId, attachments, canManage, onUpload }: ClaimAttachmentsProps) {
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Separar imagens e documentos
  const images = attachments.filter(a => isImageFile(a.file_type))
  const documents = attachments.filter(a => !isImageFile(a.file_type))
  
  // Categorizar anexos
  const categorizedAttachments = attachments.reduce((acc, attachment) => {
    const category = attachment.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(attachment)
    return acc
  }, {} as Record<string, Attachment[]>)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !onUpload) return
    
    setIsUploading(true)
    try {
      const result = await onUpload(files)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${files.length} arquivo(s) enviado(s) com sucesso`)
      }
    } catch {
      toast.error('Erro ao enviar arquivos')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const openLightbox = (attachment: Attachment) => {
    if (isImageFile(attachment.file_type)) {
      const index = images.findIndex(img => img.id === attachment.id)
      setCurrentImageIndex(index)
      setSelectedImage(attachment)
    }
  }
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1
      setCurrentImageIndex(newIndex)
      setSelectedImage(images[newIndex])
    } else {
      const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0
      setCurrentImageIndex(newIndex)
      setSelectedImage(images[newIndex])
    }
  }
  
  const downloadFile = (attachment: Attachment) => {
    window.open(attachment.file_url, '_blank')
  }
  
  const getCategoryConfig = (category?: string) => {
    return categoryLabels[category || 'other'] || categoryLabels.other
  }
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Anexos
              {attachments.length > 0 && (
                <Badge variant="secondary">
                  {attachments.length}
                </Badge>
              )}
            </CardTitle>
            
            {canManage && onUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {isUploading ? 'Enviando...' : 'Adicionar'}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum anexo adicionado ainda
            </p>
          ) : (
            <>
              {/* Grid de Imagens */}
              {images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Fotos ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((attachment) => {
                      const categoryConfig = getCategoryConfig(attachment.category)
                      
                      return (
                        <div 
                          key={attachment.id}
                          className="relative group aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => openLightbox(attachment)}
                        >
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Overlay com ações */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(attachment)
                              }}
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadFile(attachment)
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Badge de categoria */}
                          {attachment.category && (
                            <Badge 
                              variant="outline" 
                              className={`absolute top-2 left-2 text-[10px] px-1.5 py-0 ${categoryConfig.color}`}
                            >
                              {categoryConfig.label}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Lista de Documentos */}
              {documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos ({documents.length})
                  </h4>
                  <div className="space-y-2">
                    {documents.map((attachment) => {
                      const categoryConfig = getCategoryConfig(attachment.category)
                      const CategoryIcon = categoryConfig.icon
                      
                      return (
                        <div 
                          key={attachment.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg ${categoryConfig.color}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatFileSize(attachment.file_size)}</span>
                                <span>•</span>
                                <span>
                                  {formatDistanceToNow(new Date(attachment.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => downloadFile(attachment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Lightbox para visualização de imagens */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-sm">
                {selectedImage?.file_name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => selectedImage && downloadFile(selectedImage)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedImage && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.file_name}
                className="max-h-[80vh] max-w-full object-contain"
              />
              
              {/* Navegação */}
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 h-10 w-10 text-white hover:bg-white/20 rounded-full"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 h-10 w-10 text-white hover:bg-white/20 rounded-full"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Contador */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

