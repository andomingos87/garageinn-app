/**
 * Gapp Mobile - ProtectedView Component
 * 
 * Componente para gating de UI baseado em permissões.
 * Renderiza conteúdo apenas se o usuário tem permissão.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions, useGate } from '../../modules/user/hooks/usePermissions';
import {
  Permission,
  PermissionContext,
  GateConfig,
} from '../../modules/user/types/permissions.types';
import { useThemeColors, typography, spacing } from '../../theme';
import { Loading } from '../ui';

interface ProtectedViewProps {
  /**
   * Conteúdo a ser renderizado quando autorizado
   */
  children: React.ReactNode;

  /**
   * Permissão necessária (alternativa a gate)
   */
  permission?: Permission;

  /**
   * Lista de permissões necessárias (todas devem ser atendidas)
   */
  permissions?: Permission[];

  /**
   * Lista de permissões alternativas (pelo menos uma)
   */
  anyOfPermissions?: Permission[];

  /**
   * Configuração de gate (alternativa a permissions)
   */
  gate?: GateConfig;

  /**
   * Contexto para verificação de permissão
   */
  context?: PermissionContext;

  /**
   * Se deve esconder completamente quando negado (default: true)
   */
  hideWhenDenied?: boolean;

  /**
   * Componente a ser renderizado quando negado (se hideWhenDenied = false)
   */
  fallback?: React.ReactNode;

  /**
   * Se deve mostrar loading enquanto carrega permissões
   */
  showLoading?: boolean;

  /**
   * Se deve mostrar mensagem de acesso negado (se hideWhenDenied = false e sem fallback)
   */
  showDeniedMessage?: boolean;

  /**
   * Mensagem customizada de acesso negado
   */
  deniedMessage?: string;
}

/**
 * Componente para proteger conteúdo baseado em permissões
 * 
 * @example
 * // Com permissão única
 * <ProtectedView permission="checklist:execute_supervision">
 *   <SupervisionButton />
 * </ProtectedView>
 * 
 * @example
 * // Com gate config
 * <ProtectedView gate={{ allowedRoles: ['Gerente', 'Supervisor'] }}>
 *   <AdminPanel />
 * </ProtectedView>
 * 
 * @example
 * // Com fallback
 * <ProtectedView 
 *   permission="ticket:create"
 *   hideWhenDenied={false}
 *   fallback={<DisabledButton />}
 * >
 *   <CreateTicketButton />
 * </ProtectedView>
 */
export function ProtectedView({
  children,
  permission,
  permissions,
  anyOfPermissions,
  gate,
  context,
  hideWhenDenied = true,
  fallback,
  showLoading = false,
  showDeniedMessage = false,
  deniedMessage,
}: ProtectedViewProps) {
  const { can, canAll, canAny, checkGate, loading } = usePermissions();
  const colors = useThemeColors();

  // Calcula resultado da autorização
  const authResult = useMemo(() => {
    // Se tem gate config, usa ela
    if (gate) {
      return checkGate(gate, context);
    }

    // Se tem permissão única
    if (permission) {
      const granted = can(permission, context);
      return { granted };
    }

    // Se tem lista de permissões (AND)
    if (permissions && permissions.length > 0) {
      const granted = canAll(permissions, context);
      return { granted };
    }

    // Se tem lista de permissões alternativas (OR)
    if (anyOfPermissions && anyOfPermissions.length > 0) {
      const granted = canAny(anyOfPermissions, context);
      return { granted };
    }

    // Se nenhuma condição foi especificada, permite
    return { granted: true };
  }, [
    gate,
    permission,
    permissions,
    anyOfPermissions,
    context,
    can,
    canAll,
    canAny,
    checkGate,
  ]);

  // Mostra loading se necessário
  if (showLoading && loading) {
    return <Loading size="small" />;
  }

  // Se autorizado, renderiza children
  if (authResult.granted) {
    return <>{children}</>;
  }

  // Se deve esconder completamente
  if (hideWhenDenied) {
    return null;
  }

  // Se tem fallback, renderiza
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se deve mostrar mensagem de acesso negado
  if (showDeniedMessage) {
    const message = deniedMessage ?? gate?.deniedMessage ?? 'Você não tem acesso a esta funcionalidade.';
    return (
      <View style={[styles.deniedContainer, { backgroundColor: colors.muted }]}>
        <Text style={[styles.deniedText, { color: colors.mutedForeground }]}>
          🔒 {message}
        </Text>
      </View>
    );
  }

  // Default: esconde
  return null;
}

/**
 * Componente para exibir mensagem de acesso negado
 */
interface AccessDeniedMessageProps {
  message?: string;
}

export function AccessDeniedMessage({ message }: AccessDeniedMessageProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.deniedContainer, { backgroundColor: colors.muted }]}>
      <Text style={[styles.deniedText, { color: colors.mutedForeground }]}>
        🔒 {message ?? 'Você não tem acesso a esta funcionalidade.'}
      </Text>
    </View>
  );
}

/**
 * Componente para exibir tela inteira de acesso negado
 */
interface AccessDeniedScreenProps {
  title?: string;
  message?: string;
}

export function AccessDeniedScreen({
  title = 'Acesso Restrito',
  message = 'Você não tem permissão para acessar esta área.',
}: AccessDeniedScreenProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.deniedScreen, { backgroundColor: colors.background }]}>
      <Text style={styles.deniedIcon}>🔐</Text>
      <Text style={[styles.deniedTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      <Text style={[styles.deniedScreenText, { color: colors.mutedForeground }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  deniedContainer: {
    padding: spacing[4],
    borderRadius: 8,
    alignItems: 'center',
  },
  deniedText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  deniedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  deniedIcon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  deniedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[2],
  },
  deniedScreenText: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
    maxWidth: 280,
  },
});

