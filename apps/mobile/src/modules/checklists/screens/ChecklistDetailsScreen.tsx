/**
 * Gapp Mobile - Checklist Details Screen
 * 
 * Detalhes de uma execução de checklist.
 * Exibe perguntas, respostas, observações e fotos.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Badge, Loading, EmptyState, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';
import * as checklistService from '../services/checklistService';
import { ChecklistExecutionWithDetails } from '../types/checklist.types';

type Props = ChecklistsStackScreenProps<'ChecklistDetails'>;

export function ChecklistDetailsScreen({ route, navigation }: Props) {
  const { executionId } = route.params;
  const colors = useThemeColors();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [execution, setExecution] = useState<ChecklistExecutionWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carrega detalhes
  const loadDetails = useCallback(async () => {
    try {
      const data = await checklistService.fetchExecutionDetails(executionId);
      setExecution(data);
      setError(null);
    } catch (err) {
      logger.error('ChecklistDetailsScreen: Failed to load', { error: err });
      setError('Erro ao carregar detalhes da execução');
    }
  }, [executionId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadDetails();
      setLoading(false);
    };
    load();
  }, [loadDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDetails();
    setRefreshing(false);
  }, [loadDetails]);

  // Formata data
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcula estatísticas
  const getStats = () => {
    if (!execution?.answers) return { total: 0, yes: 0, no: 0, percent: 0 };
    const total = execution.answers.length;
    const yes = execution.answers.filter(a => a.answer).length;
    const no = total - yes;
    const percent = total > 0 ? Math.round((yes / total) * 100) : 0;
    return { total, yes, no, percent };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loading size="large" text="Carregando detalhes..." />
      </SafeAreaView>
    );
  }

  if (error || !execution) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <EmptyState
            title="Erro ao carregar"
            description={error || 'Execução não encontrada'}
            icon="❌"
          />
          <Button variant="outline" onPress={onRefresh} style={styles.retryButton}>
            Tentar Novamente
          </Button>
          <Button variant="ghost" onPress={() => navigation.goBack()} style={styles.backButton}>
            Voltar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
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
        {/* Header Info */}
        <Card style={styles.headerCard}>
          <CardContent>
            <View style={styles.headerInfo}>
              <View style={styles.headerRow}>
                <Ionicons name="document-text-outline" size={24} color={themeColors.primary.DEFAULT} />
                <View style={styles.headerText}>
                  <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                    {execution.template?.name || 'Checklist'}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                    {execution.template?.type === 'opening' ? 'Checklist de Abertura' : 'Checklist de Supervisão'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {execution.unit?.name || 'Unidade'}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {formatDate(execution.completedAt || execution.startedAt)}
                  </Text>
                </View>
              </View>

              {execution.executor && (
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {execution.executor.fullName}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsCard}>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.primary.DEFAULT }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Total
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.success }]}>
                  {stats.yes}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Conforme
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.destructive }]}>
                  {stats.no}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Não-conforme
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text 
                  style={[
                    styles.statValue, 
                    { 
                      color: stats.percent >= 80 
                        ? themeColors.success 
                        : stats.percent >= 50 
                          ? themeColors.warning 
                          : themeColors.destructive,
                    },
                  ]}
                >
                  {stats.percent}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Conformidade
                </Text>
              </View>
            </View>

            {execution.hasNonConformities && (
              <View style={[styles.warningBanner, { backgroundColor: themeColors.warning + '20' }]}>
                <Ionicons name="warning" size={20} color={themeColors.warning} />
                <Text style={[styles.warningText, { color: themeColors.warning }]}>
                  Esta execução possui não-conformidades
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Lista de Respostas */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Respostas
        </Text>

        {execution.answers && execution.answers.length > 0 ? (
          execution.answers
            .sort((a, b) => (a.question?.orderIndex || 0) - (b.question?.orderIndex || 0))
            .map((answer, index) => (
              <Card 
                key={answer.id} 
                style={[
                  styles.answerCard,
                  !answer.answer && { borderLeftWidth: 3, borderLeftColor: themeColors.destructive },
                ]}
              >
                <CardContent>
                  <View style={styles.answerHeader}>
                    <Text style={[styles.answerNumber, { color: colors.mutedForeground }]}>
                      #{index + 1}
                    </Text>
                    <Badge variant={answer.answer ? 'success' : 'destructive'}>
                      {answer.answer ? 'Sim' : 'Não'}
                    </Badge>
                  </View>
                  
                  <Text style={[styles.answerQuestion, { color: colors.foreground }]}>
                    {answer.question?.questionText || 'Pergunta'}
                  </Text>

                  {answer.observation && (
                    <View style={[styles.observationBox, { backgroundColor: colors.muted }]}>
                      <Ionicons name="chatbox-outline" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.observationText, { color: colors.foreground }]}>
                        {answer.observation}
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))
        ) : (
          <Card style={styles.answerCard}>
            <CardContent>
              <EmptyState
                title="Sem respostas"
                description="Nenhuma resposta registrada para esta execução."
                icon="📋"
              />
            </CardContent>
          </Card>
        )}

        {/* Observações Gerais */}
        {execution.generalObservations && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Observações Gerais
            </Text>
            <Card style={styles.observationsCard}>
              <CardContent>
                <Text style={[styles.generalObservations, { color: colors.foreground }]}>
                  {execution.generalObservations}
                </Text>
              </CardContent>
            </Card>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[4],
  },
  retryButton: {
    marginTop: spacing[4],
  },
  backButton: {
    marginTop: spacing[2],
  },
  headerCard: {
    marginBottom: spacing[4],
  },
  headerInfo: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as '700',
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    marginTop: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: typography.sizes.sm,
  },
  statsCard: {
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[3],
    gap: spacing[2],
  },
  warningText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  answerCard: {
    marginBottom: spacing[3],
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  answerNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
  },
  answerQuestion: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
  },
  observationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[3],
    gap: spacing[2],
  },
  observationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
  },
  observationsCard: {
    marginBottom: spacing[4],
  },
  generalObservations: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
  },
});
