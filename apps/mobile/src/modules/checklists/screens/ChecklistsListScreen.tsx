/**
 * Gapp Mobile - Checklists List Screen
 * 
 * Lista de checklists disponíveis e histórico de execuções.
 * Implementa:
 * - Templates disponíveis para execução
 * - Histórico de execuções do usuário
 * - Indicador de rascunhos pendentes
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Loading, EmptyState } from '../../../components/ui';
import { logger } from '../../../lib/observability';
import { useUserProfileContext } from '../../user/context/UserProfileContext';
import { useUnitSelection } from '../hooks/useUnitSelection';
import * as checklistService from '../services/checklistService';
import * as draftService from '../services/draftService';
import { ChecklistExecutionWithDetails } from '../types/checklist.types';

type NavigationProp = ChecklistsStackScreenProps<'ChecklistsList'>['navigation'];

export function ChecklistsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const { profile } = useUserProfileContext();
  const { selectedUnitId, selectedUnit, availableUnits } = useUnitSelection();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ChecklistExecutionWithDetails[]>([]);
  const [pendingDraftsCount, setPendingDraftsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Carrega histórico
  const loadHistory = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const executions = await checklistService.fetchExecutionHistory({
        userId: profile.id,
        limit: 10,
      });
      setHistory(executions);
      setError(null);
    } catch (err) {
      logger.error('ChecklistsListScreen: Failed to load history', { error: err });
      setError('Erro ao carregar histórico');
    }
  }, [profile?.id]);

  // Carrega contagem de rascunhos
  const loadDraftsCount = useCallback(async () => {
    const count = await draftService.getPendingDraftsCount();
    setPendingDraftsCount(count);
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadHistory(), loadDraftsCount()]);
      setLoading(false);
    };
    load();
  }, [loadHistory, loadDraftsCount]);

  // Atualiza ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadDraftsCount();
    }, [loadHistory, loadDraftsCount])
  );

  useEffect(() => {
    logger.info('ChecklistsListScreen mounted');
  }, []);

  const onRefresh = useCallback(async () => {
    logger.info('ChecklistsListScreen refreshing');
    setRefreshing(true);
    await Promise.all([loadHistory(), loadDraftsCount()]);
    setRefreshing(false);
  }, [loadHistory, loadDraftsCount]);

  const handleStartChecklist = (type: 'opening' | 'supervision') => {
    logger.info('Starting checklist', { type });
    navigation.navigate('ChecklistExecution', { 
      checklistId: type,
    });
  };

  const handleViewExecution = (executionId: string) => {
    logger.info('Viewing execution', { executionId });
    navigation.navigate('ChecklistDetails', { executionId });
  };

  // Formata data
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hoje, ${time}`;
    if (isYesterday) return `Ontem, ${time}`;
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcula conformidade
  const getConformityBadge = (execution: ChecklistExecutionWithDetails) => {
    if (!execution.answers || execution.answers.length === 0) {
      return <Badge variant="secondary">N/A</Badge>;
    }
    
    const yesCount = execution.answers.filter(a => a.answer).length;
    const total = execution.answers.length;
    const percent = Math.round((yesCount / total) * 100);

    if (percent >= 90) return <Badge variant="success">{percent}%</Badge>;
    if (percent >= 70) return <Badge variant="warning">{percent}%</Badge>;
    return <Badge variant="destructive">{percent}%</Badge>;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Loading size="large" text="Carregando checklists..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={themeColors.primary.DEFAULT}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            📋 Checklists
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Execute e acompanhe seus checklists
          </Text>
        </View>

        {/* Alerta de rascunhos pendentes */}
        {pendingDraftsCount > 0 && (
          <Card style={[styles.draftAlert, { borderColor: themeColors.warning }]}>
            <CardContent style={styles.draftAlertContent}>
              <Ionicons name="save-outline" size={24} color={themeColors.warning} />
              <View style={styles.draftAlertText}>
                <Text style={[styles.draftAlertTitle, { color: colors.foreground }]}>
                  Rascunho Pendente
                </Text>
                <Text style={[styles.draftAlertDesc, { color: colors.mutedForeground }]}>
                  {pendingDraftsCount} checklist(s) não finalizados
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </CardContent>
          </Card>
        )}

        {/* Info da unidade atual */}
        {selectedUnit && (
          <View style={styles.unitInfo}>
            <Ionicons name="business-outline" size={16} color={themeColors.primary.DEFAULT} />
            <Text style={[styles.unitInfoText, { color: colors.mutedForeground }]}>
              {selectedUnit.name} ({selectedUnit.code})
            </Text>
          </View>
        )}

        {/* Checklists Disponíveis */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Disponíveis para Execução
        </Text>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitle}>
                <Ionicons name="sunny-outline" size={20} color={themeColors.primary.DEFAULT} />
                <CardTitle style={styles.cardTitleText}>Checklist de Abertura</CardTitle>
              </View>
              <Badge variant="info">Diário</Badge>
            </View>
            <CardDescription>Verificações de abertura da unidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="default" 
              onPress={() => handleStartChecklist('opening')}
            >
              <Ionicons name="play-circle-outline" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: spacing[2] }}>Iniciar Execução</Text>
            </Button>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderTitle}>
                <Ionicons name="clipboard-outline" size={20} color={themeColors.primary.DEFAULT} />
                <CardTitle style={styles.cardTitleText}>Checklist de Supervisão</CardTitle>
              </View>
              <Badge variant="secondary">Periódico</Badge>
            </View>
            <CardDescription>Verificações de supervisão da unidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onPress={() => handleStartChecklist('supervision')}
            >
              <Ionicons name="play-circle-outline" size={20} color={themeColors.primary.DEFAULT} />
              <Text style={{ color: themeColors.primary.DEFAULT, marginLeft: spacing[2] }}>
                Iniciar Execução
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Histórico Recente
        </Text>

        {error ? (
          <Card style={styles.card}>
            <CardContent>
              <EmptyState
                title="Erro ao carregar"
                description={error}
                icon="❌"
              />
              <Button variant="outline" onPress={onRefresh} style={styles.retryButton}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card style={styles.card}>
            <CardContent>
              <EmptyState
                title="Nenhuma execução"
                description="Você ainda não executou nenhum checklist."
                icon="📋"
              />
            </CardContent>
          </Card>
        ) : (
          <Card style={styles.card}>
            <CardContent style={styles.historyContent}>
              {history.map((execution, index) => (
                <TouchableOpacity
                  key={execution.id}
                  style={[
                    styles.historyItem,
                    index < history.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleViewExecution(execution.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyTitle, { color: colors.foreground }]}>
                      {execution.template?.name || 'Checklist'}
                    </Text>
                    <View style={styles.historyMeta}>
                      <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                        {formatDate(execution.completedAt || execution.startedAt)}
                      </Text>
                      {execution.unit && (
                        <Text style={[styles.historyUnit, { color: colors.mutedForeground }]}>
                          • {execution.unit.code}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.historyBadge}>
                    {getConformityBadge(execution)}
                    {execution.hasNonConformities && (
                      <Ionicons 
                        name="warning" 
                        size={16} 
                        color={themeColors.warning} 
                        style={styles.warningIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Estatísticas rápidas */}
        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Resumo
            </Text>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statContent}>
                  <Text style={[styles.statValue, { color: themeColors.primary.DEFAULT }]}>
                    {history.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                    Execuções
                  </Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statContent}>
                  <Text style={[styles.statValue, { color: themeColors.warning }]}>
                    {history.filter(e => e.hasNonConformities).length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                    Com NC
                  </Text>
                </CardContent>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  draftAlert: {
    marginBottom: spacing[4],
    borderWidth: 1,
  },
  draftAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  draftAlertText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  draftAlertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as '600',
  },
  draftAlertDesc: {
    fontSize: typography.sizes.sm,
  },
  unitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  unitInfoText: {
    fontSize: typography.sizes.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  card: {
    marginBottom: spacing[3],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardTitleText: {
    marginLeft: spacing[1],
  },
  historyContent: {
    paddingVertical: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as '500',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  historyDate: {
    fontSize: typography.sizes.sm,
  },
  historyUnit: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing[1],
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginLeft: spacing[2],
  },
  retryButton: {
    marginTop: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
});
