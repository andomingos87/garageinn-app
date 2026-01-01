/**
 * Gapp Mobile - Checklists Stack Navigator
 * 
 * Stack de navegação para checklists operacionais.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChecklistsStackParamList } from '../types';
import { useThemeColors, typography } from '../../theme';

// Screens
import { ChecklistsListScreen } from '../../modules/checklists/screens/ChecklistsListScreen';
import { ChecklistExecutionScreen } from '../../modules/checklists/screens/ChecklistExecutionScreen';
import { ChecklistDetailsScreen } from '../../modules/checklists/screens/ChecklistDetailsScreen';

const Stack = createNativeStackNavigator<ChecklistsStackParamList>();

export function ChecklistsStack() {
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
        name="ChecklistsList" 
        component={ChecklistsListScreen}
        options={{ 
          title: 'Checklists',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ChecklistExecution" 
        component={ChecklistExecutionScreen}
        options={{ title: 'Executar Checklist' }}
      />
      <Stack.Screen 
        name="ChecklistDetails" 
        component={ChecklistDetailsScreen}
        options={{ title: 'Detalhes' }}
      />
    </Stack.Navigator>
  );
}

