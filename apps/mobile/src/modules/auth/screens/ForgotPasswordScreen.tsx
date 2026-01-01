/**
 * Gapp Mobile - Forgot Password Screen
 * 
 * Tela de recuperação de senha.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = RootStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async () => {
    logger.info('Password reset requested', { email });
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSent(true);
  };

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
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
    marginBottom: spacing[4],
  },
});

