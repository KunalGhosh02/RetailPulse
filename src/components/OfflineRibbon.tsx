import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: 'red',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: 'white',
  },
});

const OfflineModeBanner = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>Offline Mode</Text>
    </View>
  );
};

export default OfflineModeBanner;
