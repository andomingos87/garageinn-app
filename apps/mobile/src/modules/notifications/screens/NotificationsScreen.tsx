/**
 * Gapp Mobile - Notifications Screen
 * 
 * Tela de notificações do usuário.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardContent, EmptyState, Badge } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = RootStackScreenProps<'Notifications'>;

export function NotificationsScreen({}: Props) {
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('NotificationsScreen mounted');
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Sample notifications */}
      <Card style={styles.card}>
        <CardContent>
          <View style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <Badge variant="info">Novo</Badge>
              <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                Há 5 min
              </Text>
            </View>
            <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
              Checklist pendente
            </Text>
            <Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>
              Você tem um checklist de fechamento pendente para hoje.
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardContent>
          <View style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <Badge variant="success">Aprovado</Badge>
              <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                Há 2 horas
              </Text>
            </View>
            <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
              Chamado #1234 aprovado
            </Text>
            <Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>
              Seu chamado de manutenção foi aprovado e está em execução.
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardContent>
          <View style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <Badge variant="warning">Atenção</Badge>
              <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                Ontem
              </Text>
            </View>
            <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
              Sinistro aguardando documentos
            </Text>
            <Text style={[styles.notificationBody, { color: colors.mutedForeground }]}>
              O sinistro #567 está aguardando envio de documentação adicional.
            </Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
  },
  card: {
    marginBottom: spacing[3],
  },
  notificationItem: {},
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
  },
  notificationTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[1],
  },
  notificationBody: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});

