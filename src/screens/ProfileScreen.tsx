import React from 'react';
import { Button, Text, useTheme } from 'react-native-paper';
import { selectUserData, signOutWithFirebase } from '../state/slices';
import { View } from 'react-native';
import { useAppDispatch } from '../state/store';
import { useSelector } from 'react-redux';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const userData = useSelector(selectUserData);
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 24,
          marginBottom: 16,
        }}>
        Profile
      </Text>
      <Text
        style={{
          fontSize: 18,
          marginBottom: 8,
        }}>
        Email: {userData?.email}
      </Text>
      <Text
        style={{
          fontSize: 18,
          marginBottom: 8,
        }}>
        Signed In Since:{' '}
        {new Date(userData?.metadata.lastSignInTime ?? '').toLocaleString('IN')}
      </Text>
      <Button
        mode="contained"
        style={{
          marginTop: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => dispatch(signOutWithFirebase())}>
        Logout
      </Button>
    </View>
  );
};

export default ProfileScreen;
