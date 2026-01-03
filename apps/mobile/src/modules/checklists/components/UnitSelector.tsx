/**
 * Gapp Mobile - UnitSelector Component
 * 
 * Componente para seleção de unidade antes de iniciar um checklist.
 * Exibe dropdown para seleção quando usuário tem múltiplas unidades.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardContent } from '../../../components/ui';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface UnitSelectorProps {
  units: Unit[];
  selectedUnit: Unit | null;
  onSelect: (unit: Unit) => void;
  disabled?: boolean;
  canSelect?: boolean;
  label?: string;
}

export function UnitSelector({
  units,
  selectedUnit,
  onSelect,
  disabled = false,
  canSelect = true,
  label = 'Unidade',
}: UnitSelectorProps) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (unit: Unit) => {
    onSelect(unit);
    setModalVisible(false);
  };

  // Se não pode selecionar ou só tem uma unidade, mostra readonly
  if (!canSelect || units.length <= 1) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Card style={styles.readonlyCard}>
          <CardContent style={styles.readonlyContent}>
            <View style={styles.unitInfo}>
              <Ionicons 
                name="business-outline" 
                size={20} 
                color={themeColors.primary.DEFAULT} 
              />
              <View style={styles.unitText}>
                <Text style={[styles.unitName, { color: colors.foreground }]}>
                  {selectedUnit?.name || 'Nenhuma unidade'}
                </Text>
                {selectedUnit?.code && (
                  <Text style={[styles.unitCode, { color: colors.mutedForeground }]}>
                    {selectedUnit.code}
                  </Text>
                )}
              </View>
            </View>
            {!canSelect && units.length <= 1 && (
              <Ionicons 
                name="lock-closed-outline" 
                size={16} 
                color={colors.mutedForeground} 
              />
            )}
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          disabled && styles.selectorDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Ionicons 
            name="business-outline" 
            size={20} 
            color={themeColors.primary.DEFAULT} 
          />
          <View style={styles.unitText}>
            <Text 
              style={[
                styles.unitName, 
                { color: selectedUnit ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {selectedUnit?.name || 'Selecione uma unidade'}
            </Text>
            {selectedUnit?.code && (
              <Text style={[styles.unitCode, { color: colors.mutedForeground }]}>
                {selectedUnit.code}
              </Text>
            )}
          </View>
        </View>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.mutedForeground} 
        />
      </TouchableOpacity>

      {/* Modal de seleção */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Selecione a Unidade
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={units}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.unitItem,
                    { borderBottomColor: colors.border },
                    selectedUnit?.id === item.id && {
                      backgroundColor: themeColors.primary.DEFAULT + '15',
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.unitItemContent}>
                    <Ionicons 
                      name="business-outline" 
                      size={20} 
                      color={
                        selectedUnit?.id === item.id 
                          ? themeColors.primary.DEFAULT 
                          : colors.mutedForeground
                      } 
                    />
                    <View style={styles.unitText}>
                      <Text 
                        style={[
                          styles.unitItemName, 
                          { color: colors.foreground },
                          selectedUnit?.id === item.id && { 
                            color: themeColors.primary.DEFAULT,
                            fontWeight: typography.weights.semibold as '600',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.unitCode, { color: colors.mutedForeground }]}>
                        {item.code}
                      </Text>
                    </View>
                  </View>
                  {selectedUnit?.id === item.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={themeColors.primary.DEFAULT} 
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.unitList}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
    marginBottom: spacing[2],
  },
  readonlyCard: {
    marginBottom: 0,
  },
  readonlyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitText: {
    marginLeft: spacing[3],
    flex: 1,
  },
  unitName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  unitCode: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: spacing[6],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
  },
  unitList: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
  },
  unitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitItemName: {
    fontSize: typography.sizes.base,
  },
});

