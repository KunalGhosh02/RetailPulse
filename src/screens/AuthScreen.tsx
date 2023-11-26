import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';

import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { appStore } from '../state/store';
import { selectAuth, signInWithFirebase } from '../state/slices';
import { useSelector } from 'react-redux';

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
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>
      <TextInput
        mode="outlined"
        label="Email"
        placeholder="you@retailpulse.com"
        value={email}
        onChangeText={text => setEmail(text)}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        mode="outlined"
        label="Password"
        placeholder="Super secret password"
        secureTextEntry={!showPassword}
        onChangeText={text => setPassword(text)}
        style={{ marginBottom: 16 }}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <Button
        mode="outlined"
        loading={authState.loading}
        disabled={buttonDisabled || authState.loading}
        style={{
          backgroundColor:
            buttonDisabled || authState.loading
              ? theme.colors.surfaceDisabled
              : theme.colors.primary,
        }}
        labelStyle={{ color: 'white' }}
        onPress={handleLogin}>
        Sign In
      </Button>
    </View>
  );
};

export default AuthScreen;
