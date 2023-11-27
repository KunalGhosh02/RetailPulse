import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootTabNavigator, RootTabParamList } from './RootTabNavigator';
import AuthScreen from '../screens/AuthScreen';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../state/slices';
import ShopScreen from '../screens/StoreScreen';
import { Shop } from '../state/slices/data';
import { MaterialBottomTabNavigationProp } from 'react-native-paper';
import CaptureShopScreen from '../screens/CaptureShopScreen';

export type RootStackParamList = {
  Root: MaterialBottomTabNavigationProp<RootTabParamList>;
  Auth: undefined;
  ShopDetail: { shop: Shop };
  CaptureShop: { shopId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          <Stack.Screen name="ShopDetail" component={ShopScreen} />
          <Stack.Screen name="CaptureShop" component={CaptureShopScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
