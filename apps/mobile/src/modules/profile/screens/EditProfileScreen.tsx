/**
 * Gapp Mobile - Edit Profile Screen
 * 
 * Tela de edição do perfil do usuário.
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ProfileStackScreenProps } from '../../../navigation/types';
import { useThemeColors, spacing } from '../../../theme';
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Button } from '../../../components/ui';

type Props = ProfileStackScreenProps<'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const colors = useThemeColors();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Em desenvolvimento"
            description="Formulário de edição de perfil será implementado aqui."
            icon="✏️"
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

