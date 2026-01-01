/**
 * Gapp Mobile - Main App Entry
 * 
 * Aplicativo mobile Garageinn para operações de campo.
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Loading } from './src/components/ui';
import { colors, typography, spacing, useThemeColors } from './src/theme';

export default function App() {
  const colorScheme = useColorScheme();
  const themeColors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.foreground }]}>
          Gapp Mobile
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
          Garageinn - Operações de Campo
        </Text>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Épico 0 - Fundação</CardTitle>
            <CardDescription>
              Projeto Expo + TypeScript configurado com sucesso!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.badgeRow}>
              <Badge variant="success">Concluído</Badge>
              <Badge variant="default">MVP</Badge>
              <Badge variant="info">v0.1.0</Badge>
            </View>
          </CardContent>
        </Card>

        <View style={styles.buttonGroup}>
          <Button variant="default" onPress={() => console.log('Primary pressed')}>
            Botão Primário
          </Button>
          <Button variant="secondary" onPress={() => console.log('Secondary pressed')}>
            Secundário
          </Button>
          <Button variant="outline" onPress={() => console.log('Outline pressed')}>
            Outline
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    paddingTop: spacing[16],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginBottom: spacing[6],
  },
  card: {
    marginBottom: spacing[6],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  buttonGroup: {
    gap: spacing[3],
  },
});
