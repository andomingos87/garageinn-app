/**
 * Gapp Mobile - Checklists List Screen
 * 
 * Lista de checklists disponíveis e histórico de execuções.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type NavigationProp = ChecklistsStackScreenProps<'ChecklistsList'>['navigation'];

export function ChecklistsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    logger.info('ChecklistsListScreen mounted');
  }, []);

  const onRefresh = React.useCallback(async () => {
    logger.info('ChecklistsListScreen refreshing');
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleStartChecklist = (checklistId: string) => {
    logger.info('Starting checklist', { checklistId });
    navigation.navigate('ChecklistExecution', { checklistId });
  };

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

        {/* Checklists Disponíveis */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Disponíveis para Execução
        </Text>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <CardTitle>Checklist de Abertura</CardTitle>
              <Badge variant="info">Diário</Badge>
            </View>
            <CardDescription>Verificações de abertura da unidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="default" 
              onPress={() => handleStartChecklist('abertura')}
            >
              Iniciar Execução
            </Button>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <CardTitle>Checklist de Fechamento</CardTitle>
              <Badge variant="info">Diário</Badge>
            </View>
            <CardDescription>Verificações de fechamento da unidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="default" 
              onPress={() => handleStartChecklist('fechamento')}
            >
              Iniciar Execução
            </Button>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Histórico Recente
        </Text>

        <Card style={styles.card}>
          <CardContent>
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]}>
                  Checklist de Abertura
                </Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                  Hoje, 08:30
                </Text>
              </View>
              <Badge variant="success">100%</Badge>
            </View>
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]}>
                  Checklist de Fechamento
                </Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                  Ontem, 22:00
                </Text>
              </View>
              <Badge variant="success">100%</Badge>
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
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
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
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  historyDate: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
});

