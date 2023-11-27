import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const OfflineModeBanner = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 20,
        backgroundColor: 'red',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 12,
          color: 'white',
        }}>
        Offline Mode
      </Text>
    </View>
  );
};

export default OfflineModeBanner;
