/**
 * Gapp Mobile - Login Screen
 * 
 * Tela de login com branding Garageinn.
 */

import React from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../../../navigation/types';
import { useThemeColors, typography, spacing, colors as themeColors } from '../../../theme';
import { Card, CardContent, Input, Button } from '../../../components/ui';
import { logger } from '../../../lib/observability';

type NavigationProp = RootStackScreenProps<'Login'>['navigation'];

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    logger.info('LoginScreen mounted');
  }, []);

  const handleLogin = async () => {
    logger.info('Login attempt', { email });
    setLoading(true);
    // TODO: Implementar autenticação real
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    logger.info('Login successful');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo/Branding */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: themeColors.primary.DEFAULT }]}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Gapp Mobile
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Garageinn - Operações de Campo
            </Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <CardContent>
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <View style={styles.inputSpacer} />
              <Input
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
              <View style={styles.buttonSpacer} />
              <Button 
                variant="default" 
                onPress={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button 
                variant="ghost" 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotButton}
              >
                Esqueci minha senha
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            © 2026 Garageinn. Todos os direitos reservados.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  logoText: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    marginTop: spacing[1],
  },
  card: {
    marginBottom: spacing[6],
  },
  inputSpacer: {
    height: spacing[4],
  },
  buttonSpacer: {
    height: spacing[6],
  },
  forgotButton: {
    marginTop: spacing[2],
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
  },
});

