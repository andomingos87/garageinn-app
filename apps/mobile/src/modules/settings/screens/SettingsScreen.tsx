/**
 * Gapp Mobile - Settings Screen
 * 
 * Tela de configurações do aplicativo.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, Switch } from 'react-native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = RootStackScreenProps<'Settings'>;

export function SettingsScreen({}: Props) {
  const colors = useThemeColors();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [biometrics, setBiometrics] = React.useState(false);

  React.useEffect(() => {
    logger.info('SettingsScreen mounted');
  }, []);

  const handleToggle = (setting: string, value: boolean) => {
    logger.info('Setting toggled', { setting, value });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                Notificações Push
              </Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Receber alertas de chamados e checklists
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                handleToggle('notifications', value);
              }}
              trackColor={{ false: colors.muted, true: themeColors.primary[300] }}
              thumbColor={notifications ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
          </View>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                Modo Escuro
              </Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Usar tema escuro no aplicativo
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                handleToggle('darkMode', value);
              }}
              trackColor={{ false: colors.muted, true: themeColors.primary[300] }}
              thumbColor={darkMode ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
          </View>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                Biometria
              </Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Usar Face ID / Touch ID para login
              </Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={(value) => {
                setBiometrics(value);
                handleToggle('biometrics', value);
              }}
              trackColor={{ false: colors.muted, true: themeColors.primary[300] }}
              thumbColor={biometrics ? themeColors.primary.DEFAULT : colors.mutedForeground}
            />
          </View>
        </CardContent>
      </Card>

      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Versão</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>0.1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Build</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>2026.01.01</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Ambiente</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>Desenvolvimento</Text>
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
    marginBottom: spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});

