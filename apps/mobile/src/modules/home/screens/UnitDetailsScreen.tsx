/**
 * Gapp Mobile - Unit Details Screen
 * 
 * Detalhes de uma unidade específica.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { HomeStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../../components/ui';

type Props = HomeStackScreenProps<'UnitDetails'>;

export function UnitDetailsScreen({ route }: Props) {
  const { unitId } = route.params;
  const colors = useThemeColors();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Unidade {unitId}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description="Detalhes da unidade serão exibidos aqui."
            icon="🏢"
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

