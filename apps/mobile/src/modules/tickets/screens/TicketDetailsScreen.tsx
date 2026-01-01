/**
 * Gapp Mobile - Ticket Details Screen
 * 
 * Detalhes de um chamado específico.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = TicketsStackScreenProps<'TicketDetails'>;

export function TicketDetailsScreen({ route }: Props) {
  const { ticketId } = route.params;
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('TicketDetailsScreen mounted', { ticketId });
  }, [ticketId]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Chamado #{ticketId}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description="Detalhes do chamado serão exibidos aqui."
            icon="📋"
          />
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
});

