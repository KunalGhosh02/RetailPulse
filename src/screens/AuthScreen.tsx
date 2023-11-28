import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { appStore } from '../state/store';
import { selectAuth, signInWithFirebase } from '../state/slices';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
  rootView: { flex: 1, justifyContent: 'center', padding: 16 },
  appName: { fontSize: 32, marginBottom: 16 },
  loginText: {
    fontSize: 24,
    marginBottom: 16,
  },
  inputMargin: {
    marginBottom: 16,
  },
  loginButton: { borderRadius: 5, padding: 6, marginTop: 16 },
});

const AuthScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authState = useSelector(selectAuth);

  const theme = useTheme();

  useEffect(() => {
    if (email.length > 0 && password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [email, password]);

  const handleLogin = () => {
    Keyboard.dismiss();
    appStore.dispatch(signInWithFirebase({ email, password }));
  };

  return (
    <View style={styles.rootView}>
      <Text style={{ ...styles.appName, color: theme.colors.primary }}>
        Retail Pulse (Demo)
      </Text>
      <Text style={{ ...styles.loginText, color: theme.colors.secondary }}>
        Login
      </Text>
      <TextInput
        mode="outlined"
        label="Email"
        placeholder="you@retailpulse.com"
        value={email}
        onChangeText={text => setEmail(text)}
        style={styles.inputMargin}
      />
      <TextInput
        mode="outlined"
        label="Password"
        placeholder="Super secret password"
        secureTextEntry={!showPassword}
        onChangeText={text => setPassword(text)}
        style={styles.inputMargin}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <Button
        mode="contained"
        loading={authState.loading}
        disabled={buttonDisabled || authState.loading}
        style={styles.loginButton}
        onPress={handleLogin}>
        Sign In
      </Button>
    </View>
  );
};

export default AuthScreen;
