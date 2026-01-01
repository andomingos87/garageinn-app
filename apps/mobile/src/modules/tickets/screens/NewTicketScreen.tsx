/**
 * Gapp Mobile - New Ticket Screen
 * 
 * Formulário para criar novo chamado.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { TicketsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = TicketsStackScreenProps<'NewTicket'>;

const TYPE_LABELS: Record<string, string> = {
  sinistro: 'Sinistro',
  manutencao: 'Manutenção',
  compras: 'Compras',
  rh: 'RH',
};

export function NewTicketScreen({ route, navigation }: Props) {
  const type = route.params?.type || 'manutencao';
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('NewTicketScreen mounted', { type });
  }, [type]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Novo Chamado - {TYPE_LABELS[type]}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description={`Formulário para criar chamado de ${TYPE_LABELS[type]} será implementado aqui.`}
            icon="📝"
          />
          <View style={styles.buttonContainer}>
            <Button 
              variant="outline" 
              onPress={() => navigation.goBack()}
            >
              Cancelar
            </Button>
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
  buttonContainer: {
    marginTop: spacing[4],
  },
});

