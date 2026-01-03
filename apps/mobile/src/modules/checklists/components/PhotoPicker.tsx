/**
 * Gapp Mobile - PhotoPicker Component
 * 
 * Componente para selecionar e exibir fotos anexadas ao checklist.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { ChecklistPhoto } from '../types/checklist.types';
import * as photoService from '../services/photoService';
import { logger } from '../../../lib/observability';

interface PhotoPickerProps {
  photos: ChecklistPhoto[];
  questionId?: string;
  onPhotoAdd: (photo: ChecklistPhoto) => void;
  onPhotoRemove: (photoId: string) => void;
  maxPhotos?: number;
  disabled?: boolean;
  compact?: boolean;
}

export function PhotoPicker({
  photos,
  questionId,
  onPhotoAdd,
  onPhotoRemove,
  maxPhotos = 5,
  disabled = false,
  compact = false,
}: PhotoPickerProps) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<ChecklistPhoto | null>(null);
  const [loading, setLoading] = useState(false);

  // Filtra fotos para esta pergunta (se questionId definido) ou fotos gerais
  const filteredPhotos = questionId
    ? photos.filter(p => p.questionId === questionId)
    : photos.filter(p => !p.questionId);

  const canAddMore = filteredPhotos.length < maxPhotos;

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    setModalVisible(false);
    setLoading(true);

    try {
      const uri = await photoService.pickImage(source);
      
      if (uri) {
        const photo = photoService.createPhotoObject(uri, questionId);
        onPhotoAdd(photo);
        logger.info('PhotoPicker: Photo added', { photoId: photo.id, source });
      }
    } catch (error) {
      logger.error('PhotoPicker: Failed to pick image', { error });
      Alert.alert(
        'Erro',
        'Não foi possível acessar a câmera/galeria. Verifique as permissões do app.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(
      'Remover Foto',
      'Deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => onPhotoRemove(photoId),
        },
      ]
    );
  };

  const renderPhotoItem = (photo: ChecklistPhoto) => {
    const size = compact ? 60 : 80;

    return (
      <TouchableOpacity
        key={photo.id}
        style={[
          styles.photoItem,
          { width: size, height: size },
        ]}
        onPress={() => setPreviewPhoto(photo)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        
        {/* Status de upload */}
        {photo.uploadStatus === 'uploading' && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
        
        {photo.uploadStatus === 'failed' && (
          <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(239, 68, 68, 0.8)' }]}>
            <Ionicons name="alert-circle" size={20} color="white" />
          </View>
        )}
        
        {photo.uploadStatus === 'uploaded' && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={themeColors.success} />
          </View>
        )}

        {/* Botão remover */}
        {!disabled && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemovePhoto(photo.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={22} color={themeColors.destructive} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Lista de fotos */}
      <View style={styles.photosGrid}>
        {filteredPhotos.map(renderPhotoItem)}
        
        {/* Botão adicionar */}
        {canAddMore && !disabled && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { 
                width: compact ? 60 : 80, 
                height: compact ? 60 : 80,
                borderColor: colors.border,
                backgroundColor: colors.muted,
              },
            ]}
            onPress={() => setModalVisible(true)}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={themeColors.primary.DEFAULT} />
            ) : (
              <>
                <Ionicons 
                  name="camera-outline" 
                  size={compact ? 20 : 24} 
                  color={themeColors.primary.DEFAULT} 
                />
                {!compact && (
                  <Text style={[styles.addButtonText, { color: colors.mutedForeground }]}>
                    Foto
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Info de limite */}
      {!compact && (
        <Text style={[styles.limitText, { color: colors.mutedForeground }]}>
          {filteredPhotos.length}/{maxPhotos} fotos
        </Text>
      )}

      {/* Modal de seleção de fonte */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Adicionar Foto
            </Text>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => handlePickImage('camera')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={24} color={themeColors.primary.DEFAULT} />
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Tirar Foto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handlePickImage('gallery')}
              activeOpacity={0.7}
            >
              <Ionicons name="images-outline" size={24} color={themeColors.primary.DEFAULT} />
              <Text style={[styles.modalOptionText, { color: colors.foreground }]}>
                Escolher da Galeria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.muted }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de preview */}
      <Modal
        visible={!!previewPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <Pressable
          style={styles.previewOverlay}
          onPress={() => setPreviewPhoto(null)}
        >
          {previewPhoto && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: previewPhoto.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.previewCloseButton}
                onPress={() => setPreviewPhoto(null)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing[3],
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  photoItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: typography.sizes.xs,
    marginTop: 4,
  },
  limitText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: spacing[4],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    gap: spacing[3],
  },
  modalOptionText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  cancelButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: spacing[2],
  },
});

