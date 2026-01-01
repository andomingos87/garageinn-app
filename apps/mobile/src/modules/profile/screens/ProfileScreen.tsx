/**
 * Gapp Mobile - Profile Screen
 * 
 * Tela de perfil do usuário.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type NavigationProp = ProfileStackScreenProps<'ProfileScreen'>['navigation'];

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  React.useEffect(() => {
    logger.info('ProfileScreen mounted');
  }, []);

  const handleLogout = () => {
    logger.info('User logging out');
    // TODO: Implementar logout
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            👤 Perfil
          </Text>
        </View>

        {/* User Info */}
        <Card style={styles.card}>
          <CardContent>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: themeColors.primary[100] }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>
                  João da Silva
                </Text>
                <Text style={[styles.userRole, { color: colors.mutedForeground }]}>
                  Operador de Campo
                </Text>
                <Text style={[styles.userUnit, { color: colors.mutedForeground }]}>
                  Unidade Centro - SP
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <Pressable 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                ✏️ Editar Perfil
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                🔒 Alterar Senha
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.getParent()?.getParent()?.navigate('Notifications')}
            >
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                🔔 Notificações
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.getParent()?.getParent()?.navigate('Settings')}
            >
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>
                ⚙️ Configurações
              </Text>
            </Pressable>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Sobre o App</CardTitle>
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
          </CardContent>
        </Card>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button variant="destructive" onPress={handleLogout}>
            Sair da Conta
          </Button>
        </View>
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
  card: {
    marginBottom: spacing[4],
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: themeColors.primary.DEFAULT,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  userRole: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  userUnit: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  menuItem: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: typography.sizes.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  logoutContainer: {
    marginTop: spacing[4],
  },
});

