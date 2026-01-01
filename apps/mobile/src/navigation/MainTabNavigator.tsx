/**
 * Gapp Mobile - Main Tab Navigator
 * 
 * Navegação principal por abas com tabs customizadas no estilo Garageinn.
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { useThemeColors, colors as themeColors, spacing, borderRadius } from '../theme';

// Stack Navigators
import { HomeStack } from './stacks/HomeStack';
import { ChecklistsStack } from './stacks/ChecklistsStack';
import { TicketsStack } from './stacks/TicketsStack';
import { ProfileStack } from './stacks/ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconName = 'home' | 'home-outline' | 'checkbox' | 'checkbox-outline' | 
  'document-text' | 'document-text-outline' | 'person' | 'person-outline';

const tabIcons: Record<keyof MainTabParamList, { focused: TabIconName; unfocused: TabIconName }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Checklists: { focused: 'checkbox', unfocused: 'checkbox-outline' },
  Tickets: { focused: 'document-text', unfocused: 'document-text-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

const tabLabels: Record<keyof MainTabParamList, string> = {
  Home: 'Início',
  Checklists: 'Checklists',
  Tickets: 'Chamados',
  Profile: 'Perfil',
};

export function MainTabNavigator() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const iconConfig = tabIcons[route.name as keyof MainTabParamList];
          const iconName = focused ? iconConfig.focused : iconConfig.unfocused;
          const iconColor = focused ? themeColors.primary.DEFAULT : colors.mutedForeground;

          return (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={iconName} size={size} color={iconColor} />
            </View>
          );
        },
        tabBarLabel: tabLabels[route.name as keyof MainTabParamList],
        tabBarActiveTintColor: themeColors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing[2],
          paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[2],
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Checklists" component={ChecklistsStack} />
      <Tab.Screen name="Tickets" component={TicketsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: themeColors.primary[100],
    borderRadius: borderRadius.full,
    padding: spacing[1],
  },
});

