/**
 * Gapp Mobile - Tickets List Screen
 * 
 * Lista de chamados (sinistros, manutenção, compras, RH).
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type NavigationProp = TicketsStackScreenProps<'TicketsList'>['navigation'];

const TICKET_TYPES = [
  { key: 'sinistro', label: 'Sinistros', icon: '🚗', color: themeColors.destructive.DEFAULT },
  { key: 'manutencao', label: 'Manutenção', icon: '🔧', color: themeColors.warning.DEFAULT },
  { key: 'compras', label: 'Compras', icon: '🛒', color: themeColors.info.DEFAULT },
  { key: 'rh', label: 'RH', icon: '👥', color: themeColors.success.DEFAULT },
] as const;

export function TicketsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    logger.info('TicketsListScreen mounted');
  }, []);

  const onRefresh = React.useCallback(async () => {
    logger.info('TicketsListScreen refreshing');
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleNewTicket = (type: typeof TICKET_TYPES[number]['key']) => {
    logger.info('Creating new ticket', { type });
    navigation.navigate('NewTicket', { type });
  };

  const handleViewTicket = (ticketId: string) => {
    logger.info('Viewing ticket', { ticketId });
    navigation.navigate('TicketDetails', { ticketId });
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
            📝 Chamados
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Gerencie seus chamados e solicitações
          </Text>
        </View>

        {/* Novo Chamado */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Abrir Novo Chamado
        </Text>

        <View style={styles.typesGrid}>
          {TICKET_TYPES.map((type) => (
            <Pressable
              key={type.key}
              style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleNewTicket(type.key)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[styles.typeLabel, { color: colors.foreground }]}>{type.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Chamados Recentes */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Meus Chamados
        </Text>

        <Card style={styles.card}>
          <Pressable onPress={() => handleViewTicket('1234')}>
            <CardContent>
              <View style={styles.ticketItem}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketId, { color: colors.mutedForeground }]}>#1234</Text>
                    <Badge variant="warning">Pendente</Badge>
                  </View>
                  <Text style={[styles.ticketTitle, { color: colors.foreground }]}>
                    Manutenção do portão principal
                  </Text>
                  <Text style={[styles.ticketDate, { color: colors.mutedForeground }]}>
                    Aberto há 2 dias
                  </Text>
                </View>
              </View>
            </CardContent>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Pressable onPress={() => handleViewTicket('1233')}>
            <CardContent>
              <View style={styles.ticketItem}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketId, { color: colors.mutedForeground }]}>#1233</Text>
                    <Badge variant="info">Em análise</Badge>
                  </View>
                  <Text style={[styles.ticketTitle, { color: colors.foreground }]}>
                    Sinistro - Colisão na vaga 15
                  </Text>
                  <Text style={[styles.ticketDate, { color: colors.mutedForeground }]}>
                    Aberto há 5 dias
                  </Text>
                </View>
              </View>
            </CardContent>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Pressable onPress={() => handleViewTicket('1230')}>
            <CardContent>
              <View style={styles.ticketItem}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketId, { color: colors.mutedForeground }]}>#1230</Text>
                    <Badge variant="success">Concluído</Badge>
                  </View>
                  <Text style={[styles.ticketTitle, { color: colors.foreground }]}>
                    Compra de materiais de limpeza
                  </Text>
                  <Text style={[styles.ticketDate, { color: colors.mutedForeground }]}>
                    Concluído há 1 semana
                  </Text>
                </View>
              </View>
            </CardContent>
          </Pressable>
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
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  typeCard: {
    width: '47%',
    padding: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  typeLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  card: {
    marginBottom: spacing[3],
  },
  ticketItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  ticketId: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  ticketTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1],
  },
  ticketDate: {
    fontSize: typography.sizes.sm,
  },
});

