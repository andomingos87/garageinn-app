/**
 * Gapp Mobile - Checklist Details Screen
 * 
 * Detalhes de uma execução de checklist.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { ChecklistsStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../../components/ui';

type Props = ChecklistsStackScreenProps<'ChecklistDetails'>;

export function ChecklistDetailsScreen({ route }: Props) {
  const { executionId } = route.params;
  const colors = useThemeColors();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Execução #{executionId}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description="Detalhes da execução serão exibidos aqui."
            icon="📊"
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

