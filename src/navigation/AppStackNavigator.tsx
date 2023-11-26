import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootTabNavigator } from './RootTabNavigator';
import AuthScreen from '../screens/AuthScreen';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../state/slices';

const Stack = createNativeStackNavigator();

export const AppStackNavigator = () => {
  const isSignedIn = useSelector(selectIsAuthenticated);
  return (
    <Stack.Navigator
      id="App"
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Root">
      {isSignedIn ? (
        <>
          <Stack.Screen name="Root" component={RootTabNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
