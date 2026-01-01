/**
 * Gapp Mobile - Profile Stack Navigator
 * 
 * Stack de navegação para perfil do usuário.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { useThemeColors, typography } from '../../theme';

// Screens
import { ProfileScreen } from '../../modules/profile/screens/ProfileScreen';
import { EditProfileScreen } from '../../modules/profile/screens/EditProfileScreen';
import { ChangePasswordScreen } from '../../modules/profile/screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: typography.weights.semibold as '600',
          fontSize: typography.sizes.lg,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ 
          title: 'Perfil',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Editar Perfil' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Alterar Senha' }}
      />
    </Stack.Navigator>
  );
}

