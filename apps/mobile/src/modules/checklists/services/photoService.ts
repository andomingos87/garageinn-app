/**
 * Gapp Mobile - Checklist Photo Service
 * 
 * Serviço para captura, compressão e upload de fotos de checklists.
 * Nota: Dependências expo-image-picker e expo-image-manipulator 
 * precisam ser instaladas para uso completo.
 */

import { supabase } from '../../../lib/supabase/client';
import { logger } from '../../../lib/observability';
import { ChecklistPhoto } from '../types/checklist.types';

// Constantes
const PHOTO_MAX_WIDTH = 1200;
const PHOTO_QUALITY = 0.7;
const STORAGE_BUCKET = 'checklist-photos';

/**
 * Gera um ID único para foto
 */
export function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Cria um objeto de foto inicial
 */
export function createPhotoObject(
  uri: string,
  questionId?: string
): ChecklistPhoto {
  return {
    id: generatePhotoId(),
    questionId: questionId || undefined,
    uri,
    uploadStatus: 'pending',
  };
}

/**
 * Comprime uma imagem
 * Nota: Requer expo-image-manipulator
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    // Tentativa de importar dinamicamente
    // Se não estiver instalado, retorna a imagem original
    try {
      const ImageManipulator = await import('expo-image-manipulator');
      
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: PHOTO_MAX_WIDTH } }],
        { 
          compress: PHOTO_QUALITY, 
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      logger.info('photoService: Image compressed', { 
        originalUri: uri,
        compressedUri: result.uri,
      });
      
      return result.uri;
    } catch {
      logger.warn('photoService: expo-image-manipulator not available, using original image');
      return uri;
    }
  } catch (error) {
    logger.error('photoService: Failed to compress image', { error });
    return uri;
  }
}

/**
 * Faz upload de uma foto para o Supabase Storage
 */
export async function uploadPhoto(
  photo: ChecklistPhoto,
  executionId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  logger.info('photoService: Starting upload', { 
    photoId: photo.id,
    executionId,
  });

  try {
    // Comprime a imagem
    const compressedUri = await compressImage(photo.uri);
    
    // Prepara o arquivo para upload
    const fileName = `${executionId}/${photo.id}.jpg`;
    
    // Lê o arquivo como blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    // Simula progresso (Supabase não tem callback de progresso nativo)
    onProgress?.(50);
    
    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      logger.error('photoService: Upload failed', { error });
      throw error;
    }

    onProgress?.(100);

    // Gera URL pública
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    logger.info('photoService: Upload completed', { 
      photoId: photo.id,
      path: data.path,
      url: urlData.publicUrl,
    });

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    logger.error('photoService: Upload error', { error });
    throw error;
  }
}

/**
 * Faz upload de múltiplas fotos
 */
export async function uploadPhotos(
  photos: ChecklistPhoto[],
  executionId: string,
  onPhotoProgress?: (photoId: string, progress: number) => void,
  onPhotoComplete?: (photoId: string, url: string) => void,
  onPhotoError?: (photoId: string, error: Error) => void
): Promise<Array<{ photoId: string; url: string; error?: Error }>> {
  const results: Array<{ photoId: string; url: string; error?: Error }> = [];

  for (const photo of photos) {
    try {
      const { url } = await uploadPhoto(
        photo, 
        executionId,
        (progress) => onPhotoProgress?.(photo.id, progress)
      );
      
      onPhotoComplete?.(photo.id, url);
      results.push({ photoId: photo.id, url });
    } catch (error) {
      onPhotoError?.(photo.id, error as Error);
      results.push({ 
        photoId: photo.id, 
        url: '', 
        error: error as Error,
      });
    }
  }

  return results;
}

/**
 * Remove uma foto do Storage
 */
export async function deletePhoto(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      logger.error('photoService: Delete failed', { error });
      throw error;
    }

    logger.info('photoService: Photo deleted', { filePath });
  } catch (error) {
    logger.error('photoService: Delete error', { error });
    throw error;
  }
}

/**
 * Abre a câmera ou galeria para selecionar imagem
 * Nota: Requer expo-image-picker
 */
export async function pickImage(
  source: 'camera' | 'gallery'
): Promise<string | null> {
  try {
    // Tentativa de importar dinamicamente
    const ImagePicker = await import('expo-image-picker');

    // Solicita permissões
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('photoService: Camera permission denied');
        return null;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('photoService: Gallery permission denied');
        return null;
      }
    }

    // Abre picker
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          quality: 0.8,
        });

    if (result.canceled) {
      logger.info('photoService: Image selection cancelled');
      return null;
    }

    logger.info('photoService: Image selected', { 
      source,
      uri: result.assets[0].uri,
    });

    return result.assets[0].uri;
  } catch (error) {
    logger.error('photoService: Failed to pick image', { error });
    throw error;
  }
}

/**
 * Mostra opções para selecionar fonte da imagem
 */
export function getImageSourceOptions() {
  return [
    { key: 'camera', label: 'Tirar Foto', icon: 'camera-outline' },
    { key: 'gallery', label: 'Escolher da Galeria', icon: 'images-outline' },
  ] as const;
}

