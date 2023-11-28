import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  activityIndicator: {
    flex: 1,
    margin: 10,
  },
});

const Loader = () => {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator
        size="large"
        theme={theme}
        style={styles.activityIndicator}
      />
    </View>
  );
};

export default Loader;
