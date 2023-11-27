import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

const Loader = () => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <ActivityIndicator
        size="large"
        theme={theme}
        style={{ flex: 1, margin: 10 }}
      />
    </View>
  );
};

export default Loader;
