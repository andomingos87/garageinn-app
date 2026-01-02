/**
 * Gapp Mobile - Forgot Password Screen
 * 
 * Tela de recuperação de senha.
 * Integrada com Supabase Auth para envio real de email.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';
import { useAuth } from '../hooks/useAuth';

type Props = RootStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { resetPassword, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Limpa erros ao alterar email
  React.useEffect(() => {
    if (localError) setLocalError(null);
    if (error) clearError();
  }, [email]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setLocalError('Por favor, informe seu e-mail');
      return;
    }

    logger.info('Password reset requested', { email });
    setLocalError(null);

    try {
      await resetPassword(email);
      setSent(true);
      logger.info('Password reset email sent', { email });
    } catch (e) {
      // Erro já está no estado do AuthContext
      logger.warn('Password reset failed', { email });
    }
  };

  const displayError = error?.message || localError;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            {sent 
              ? 'Verifique seu e-mail para redefinir sua senha.'
              : 'Digite seu e-mail para receber instruções de recuperação.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successIcon]}>✉️</Text>
              <Text style={[styles.successText, { color: colors.foreground }]}>
                E-mail enviado com sucesso!
              </Text>
              <Text style={[styles.successHint, { color: colors.mutedForeground }]}>
                Verifique sua caixa de entrada e spam.
              </Text>
              <Button 
                variant="outline" 
                onPress={() => navigation.goBack()}
                style={styles.button}
              >
                Voltar ao Login
              </Button>
            </View>
          ) : (
            <>
              {/* Error Message */}
              {displayError && (
                <View style={[styles.errorContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.errorText, { color: themeColors.destructive.DEFAULT }]}>
                    {displayError}
                  </Text>
                </View>
              )}

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
                onSubmitEditing={handleSubmit}
              />
              <View style={styles.buttonSpacer} />
              <Button 
                variant="default" 
                onPress={handleSubmit}
                disabled={loading || !email}
              >
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
              <Button 
                variant="ghost" 
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Voltar
              </Button>
            </>
          )}
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
    paddingTop: spacing[8],
  },
  errorContainer: {
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  errorText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: spacing[4],
  },
  button: {
    marginTop: spacing[2],
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  successText: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  successHint: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
});

