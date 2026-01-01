/**
 * Gapp Mobile - Checklist Execution Screen
 * 
 * Tela de execução de um checklist.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = ChecklistsStackScreenProps<'ChecklistExecution'>;

export function ChecklistExecutionScreen({ route, navigation }: Props) {
  const { checklistId } = route.params;
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('ChecklistExecutionScreen mounted', { checklistId });
  }, [checklistId]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Executando Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description={`Execução do checklist "${checklistId}" será implementada aqui.`}
            icon="📋"
          />
          <View style={styles.buttonContainer}>
            <Button 
              variant="outline" 
              onPress={() => navigation.goBack()}
            >
              Voltar
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

