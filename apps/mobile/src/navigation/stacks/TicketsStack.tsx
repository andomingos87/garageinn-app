/**
 * Gapp Mobile - Tickets Stack Navigator
 * 
 * Stack de navegação para chamados (sinistros, manutenção, compras, RH).
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TicketsStackParamList } from '../types';
import { useThemeColors, typography } from '../../theme';

// Screens
import { TicketsListScreen } from '../../modules/tickets/screens/TicketsListScreen';
import { TicketDetailsScreen } from '../../modules/tickets/screens/TicketDetailsScreen';
import { NewTicketScreen } from '../../modules/tickets/screens/NewTicketScreen';

const Stack = createNativeStackNavigator<TicketsStackParamList>();

export function TicketsStack() {
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
        name="TicketsList" 
        component={TicketsListScreen}
        options={{ 
          title: 'Chamados',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="TicketDetails" 
        component={TicketDetailsScreen}
        options={{ title: 'Detalhes do Chamado' }}
      />
      <Stack.Screen 
        name="NewTicket" 
        component={NewTicketScreen}
        options={{ 
          title: 'Novo Chamado',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

