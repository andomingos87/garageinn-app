/**
 * Gapp Mobile - Change Password Screen
 * 
 * Tela para alteração de senha.
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ProfileStackScreenProps } from '../../../navigation/types';
import { useThemeColors, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Button } from '../../../components/ui';

type Props = ProfileStackScreenProps<'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const colors = useThemeColors();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description="Formulário de alteração de senha será implementado aqui."
            icon="🔒"
          />
          <View style={styles.buttonContainer}>
            <Button 
              variant="outline" 
              onPress={() => navigation.goBack()}
            >
              Voltar
            </Button>
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
  buttonContainer: {
    marginTop: spacing[4],
  },
});

