import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { useTheme } from 'react-native-paper';

const Tab = createMaterialBottomTabNavigator();

export const RootTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator initialRouteName="Feed" theme={theme}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: 'home',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: 'account',
        }}
      />
    </Tab.Navigator>
  );
};
