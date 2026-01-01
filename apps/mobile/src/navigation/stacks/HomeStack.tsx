/**
 * Gapp Mobile - Home Stack Navigator
 * 
 * Stack de navegação para a área inicial/dashboard.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { useThemeColors, typography } from '../../theme';

// Screens
import { HomeScreen } from '../../modules/home/screens/HomeScreen';
import { UnitDetailsScreen } from '../../modules/home/screens/UnitDetailsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
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
        name="HomeScreen" 
        component={HomeScreen}
        options={{ 
          title: 'Início',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="UnitDetails" 
        component={UnitDetailsScreen}
        options={{ title: 'Detalhes da Unidade' }}
      />
    </Stack.Navigator>
  );
}

