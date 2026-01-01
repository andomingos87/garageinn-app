/**
 * Gapp Mobile - Reset Password Screen
 * 
 * Tela de redefinição de senha.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type Props = RootStackScreenProps<'ResetPassword'>;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { token } = route.params;
  const colors = useThemeColors();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    logger.info('ResetPasswordScreen mounted', { hasToken: !!token });
  }, [token]);

  const handleSubmit = async () => {
    logger.info('Password reset submitted');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    navigation.navigate('Login');
  };

  const isValid = password.length >= 6 && password === confirmPassword;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            label="Nova Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.inputSpacer} />
          <Input
            label="Confirmar Senha"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {password && confirmPassword && password !== confirmPassword && (
            <Text style={styles.errorText}>As senhas não coincidem</Text>
          )}
          <View style={styles.buttonSpacer} />
          <Button 
            variant="default" 
            onPress={handleSubmit}
            disabled={loading || !isValid}
          >
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
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
  inputSpacer: {
    height: spacing[4],
  },
  buttonSpacer: {
    height: spacing[6],
  },
  errorText: {
    color: '#EF4444',
    fontSize: typography.sizes.sm,
    marginTop: spacing[2],
  },
});

