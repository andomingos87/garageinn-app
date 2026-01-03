/**
 * Gapp Mobile - useUnitSelection Hook
 * 
 * Hook para gerenciar a seleção de unidade no contexto de checklists.
 * Implementa a lógica de:
 * - Manobrista/Encarregado: unidade única (sem escolha)
 * - Supervisor/Gerente: pode escolher entre unidades do escopo
 */

import { useState, useCallback, useMemo } from 'react';
import { useUserProfileContext, useUserUnits } from '../../user/context/UserProfileContext';
import { logger } from '../../../lib/observability';

interface UseUnitSelectionReturn {
  // Estado
  selectedUnitId: string | null;
  selectedUnit: { id: string; name: string; code: string } | null;
  
  // Flags
  canSelectUnit: boolean;
  hasMultipleUnits: boolean;
  isLoading: boolean;
  
  // Lista de unidades disponíveis
  availableUnits: Array<{ id: string; name: string; code: string }>;
  
  // Actions
  selectUnit: (unitId: string) => void;
  clearSelection: () => void;
}

export function useUnitSelection(): UseUnitSelectionReturn {
  const { profile, loading } = useUserProfileContext();
  const { units, primaryUnit, unitScopeType } = useUserUnits();
  
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Determina se o usuário pode selecionar unidade
  const canSelectUnit = useMemo(() => {
    if (!profile) return false;
    
    // Manobrista e Encarregado não podem escolher - usam unidade padrão
    if (unitScopeType === 'single') {
      return false;
    }
    
    // Supervisor pode escolher entre unidades de cobertura
    // Gerente/Admin pode escolher entre todas
    if (unitScopeType === 'coverage' || unitScopeType === 'all') {
      return units.length > 1;
    }
    
    return false;
  }, [profile, unitScopeType, units.length]);

  // Lista de unidades disponíveis para seleção
  const availableUnits = useMemo(() => {
    return units.map(u => ({
      id: u.unitId,
      name: u.name,
      code: u.code,
    }));
  }, [units]);

  // Verifica se há múltiplas unidades
  const hasMultipleUnits = availableUnits.length > 1;

  // Unidade selecionada (ou padrão)
  const effectiveUnitId = useMemo(() => {
    // Se já tem seleção explícita, usa ela
    if (selectedUnitId) return selectedUnitId;
    
    // Se tem unidade primária (single scope), usa ela
    if (primaryUnit) return primaryUnit.unitId;
    
    // Se tem apenas uma unidade disponível, usa ela
    if (availableUnits.length === 1) return availableUnits[0].id;
    
    return null;
  }, [selectedUnitId, primaryUnit, availableUnits]);

  // Dados da unidade selecionada
  const selectedUnit = useMemo(() => {
    if (!effectiveUnitId) return null;
    
    const unit = units.find(u => u.unitId === effectiveUnitId);
    if (!unit) return null;
    
    return {
      id: unit.unitId,
      name: unit.name,
      code: unit.code,
    };
  }, [effectiveUnitId, units]);

  // Selecionar unidade
  const selectUnit = useCallback((unitId: string) => {
    if (!canSelectUnit && unitScopeType !== 'single') {
      logger.warn('useUnitSelection: User cannot select unit', { 
        unitScopeType,
        canSelectUnit,
      });
      return;
    }

    // Valida se a unidade está disponível
    const isValid = units.some(u => u.unitId === unitId);
    if (!isValid) {
      logger.warn('useUnitSelection: Invalid unit selection', { unitId });
      return;
    }

    logger.info('useUnitSelection: Unit selected', { unitId });
    setSelectedUnitId(unitId);
  }, [canSelectUnit, unitScopeType, units]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedUnitId(null);
  }, []);

  return {
    selectedUnitId: effectiveUnitId,
    selectedUnit,
    canSelectUnit,
    hasMultipleUnits,
    isLoading: loading,
    availableUnits,
    selectUnit,
    clearSelection,
  };
}

