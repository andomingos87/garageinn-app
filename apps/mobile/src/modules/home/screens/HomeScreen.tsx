/**
 * Gapp Mobile - Home Screen
 * 
 * Tela inicial com dashboard e resumo das operações.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HomeStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type NavigationProp = HomeStackScreenProps<'HomeScreen'>['navigation'];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    logger.info('HomeScreen mounted');
  }, []);

  const onRefresh = React.useCallback(async () => {
    logger.info('HomeScreen refreshing');
    setRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // #region agent log
  console.log('[DEBUG] HomeScreen about to return JSX');
  // #endregion

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
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Bem-vindo ao
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Gapp Mobile
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Garageinn - Operações de Campo
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={[styles.statNumber, { color: themeColors.primary.DEFAULT }]}>3</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pendentes</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={[styles.statNumber, { color: themeColors.success.DEFAULT }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Concluídos</Text>
            </CardContent>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.actionsGrid}>
              <Button 
                variant="outline" 
                onPress={() => navigation.getParent()?.navigate('Checklists')}
                style={styles.actionButton}
              >
                📋 Checklists
              </Button>
              <Button 
                variant="outline" 
                onPress={() => navigation.getParent()?.navigate('Tickets')}
                style={styles.actionButton}
              >
                📝 Chamados
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.activityItem}>
              <Badge variant="success">Concluído</Badge>
              <Text style={[styles.activityText, { color: colors.foreground }]}>
                Checklist de abertura - Unidade 001
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Badge variant="warning">Pendente</Badge>
              <Text style={[styles.activityText, { color: colors.foreground }]}>
                Chamado #1234 - Manutenção
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Badge variant="info">Em análise</Badge>
              <Text style={[styles.activityText, { color: colors.foreground }]}>
                Sinistro #567 - Aguardando aprovação
              </Text>
            </View>
          </CardContent>
        </Card>
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
    marginBottom: spacing[6],
  },
  greeting: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing[1],
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  statNumber: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  card: {
    marginBottom: spacing[4],
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityText: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
});

