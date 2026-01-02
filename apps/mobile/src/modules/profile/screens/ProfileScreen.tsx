/**
 * Gapp Mobile - Profile Screen
 * 
 * Tela de perfil do usuário.
 * Integrada com AuthContext e UserProfileContext.
 * Exibe dados do usuário, cargos, departamentos e unidades.
 * Nota: CPF NÃO é exibido conforme requisito do PRD.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading } from '../../../components/ui';
import { logger } from '../../../lib/observability';
import { useAuth } from '../../auth/hooks/useAuth';
import { useUserProfileContext } from '../../user';

type NavigationProp = ProfileStackScreenProps<'ProfileScreen'>['navigation'];

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfileContext();

  React.useEffect(() => {
    logger.info('ProfileScreen mounted', { userId: user?.id, profileId: profile?.id });
  }, [user, profile]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            logger.info('User logging out', { userId: user?.id });
            try {
              await signOut();
              // Navegação acontece automaticamente via AuthContext
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // Extrai iniciais do nome
  const getInitials = () => {
    if (profile?.fullName) {
      const names = profile.fullName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Nome de exibição
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Usuário';

  // Roles formatados
  const getRolesDisplay = () => {
    if (!profile?.roles || profile.roles.length === 0) {
      return 'Sem cargo definido';
    }
    return profile.roles.map((r) => r.name).join(', ');
  };

  // Departamentos formatados (únicos)
  const getDepartmentsDisplay = () => {
    if (!profile?.roles || profile.roles.length === 0) {
      return null;
    }
    const departments = [...new Set(
      profile.roles
        .filter((r) => r.departmentName)
        .map((r) => r.departmentName!)
    )];
    if (departments.length === 0) return null;
    return departments.join(', ');
  };

  // Unidades formatadas
  const getUnitsDisplay = () => {
    if (!profile) return 'Nenhuma unidade vinculada';
    
    switch (profile.unitScopeType) {
      case 'all':
        return 'Todas as unidades';
      case 'coverage':
        const coverageNames = profile.coverageUnits.map((u) => u.name);
        return `Cobertura: ${coverageNames.join(', ')}`;
      case 'single':
        return profile.primaryUnit?.name || 'Sem unidade';
      case 'none':
      default:
        return 'Nenhuma unidade vinculada';
    }
  };

  // Indicador de tipo de escopo
  const getScopeIcon = () => {
    if (!profile) return '📍';
    switch (profile.unitScopeType) {
      case 'all': return '🌐';
      case 'coverage': return '📊';
      case 'single': return '📍';
      case 'none': return '🏢';
      default: return '📍';
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Loading size="large" text="Carregando perfil..." />
        </View>
      </SafeAreaView>
    );
  }

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
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground }]}>
                  {displayName}
                </Text>
                <Text style={[styles.userRole, { color: colors.mutedForeground }]}>
                  {getRolesDisplay()}
                </Text>
                {getDepartmentsDisplay() && (
                  <Text style={[styles.userDepartment, { color: colors.mutedForeground }]}>
                    🏬 {getDepartmentsDisplay()}
                  </Text>
                )}
                {profile?.email && (
                  <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
                    ✉️ {profile.email}
                  </Text>
                )}
                {profile?.phone && (
                  <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>
                    📞 {profile.phone}
                  </Text>
                )}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Units Info */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>{getScopeIcon()} Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={[styles.unitsText, { color: colors.foreground }]}>
              {getUnitsDisplay()}
            </Text>
            {profile?.unitScopeType === 'coverage' && profile.coverageUnits.length > 0 && (
              <View style={styles.unitsList}>
                {profile.coverageUnits.map((unit) => (
                  <View 
                    key={unit.unitId} 
                    style={[styles.unitBadge, { backgroundColor: themeColors.primary[100] }]}
                  >
                    <Text style={[styles.unitBadgeText, { color: themeColors.primary.DEFAULT }]}>
                      {unit.code}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {profile?.primaryUnit && profile.unitScopeType === 'single' && (
              <View style={styles.unitsList}>
                <View 
                  style={[styles.unitBadge, { backgroundColor: themeColors.primary[100] }]}
                >
                  <Text style={[styles.unitBadgeText, { color: themeColors.primary.DEFAULT }]}>
                    {profile.primaryUnit.code}
                  </Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {profileError && (
          <Card style={[styles.card, { borderColor: themeColors.destructive.DEFAULT }]}>
            <CardContent>
              <Text style={[styles.errorText, { color: themeColors.destructive.DEFAULT }]}>
                ⚠️ {profileError.message}
              </Text>
            </CardContent>
          </Card>
        )}

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
              <Text style={[styles.infoValue, { color: colors.foreground }]}>2026.01.02</Text>
            </View>
          </CardContent>
        </Card>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button variant="destructive" onPress={handleLogout} disabled={authLoading}>
            {authLoading ? 'Saindo...' : 'Sair da Conta'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  userDepartment: {
    fontSize: typography.sizes.sm,
    marginTop: spacing[1],
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    marginTop: spacing[2],
  },
  userPhone: {
    fontSize: typography.sizes.xs,
    marginTop: spacing[1],
  },
  unitsText: {
    fontSize: typography.sizes.base,
  },
  unitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  unitBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
  },
  unitBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
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
