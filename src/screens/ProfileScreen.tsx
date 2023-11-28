import React from 'react';
import { Button, Text, useTheme } from 'react-native-paper';
import { selectUserData, signOutWithFirebase } from '../state/slices';
import { StyleSheet, View } from 'react-native';
import { useAppDispatch } from '../state/store';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 16,
  },
  emailText: {
    fontSize: 18,
    marginBottom: 8,
  },
  lastSignInText: {
    fontSize: 18,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 16,
  },
});

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const userData = useSelector(selectUserData);
  const theme = useTheme();

  return (
    <View style={styles.rootView}>
      <Text style={styles.headerText}>Profile</Text>
      <Text style={styles.emailText}>Email: {userData?.email}</Text>
      <Text style={styles.lastSignInText}>
        Signed In Since:{' '}
        {new Date(userData?.metadata.lastSignInTime ?? '').toLocaleString('IN')}
      </Text>
      <Button
        mode="contained"
        style={{
          ...styles.logoutButton,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => dispatch(signOutWithFirebase())}>
        Logout
      </Button>
    </View>
  );
};

export default ProfileScreen;
