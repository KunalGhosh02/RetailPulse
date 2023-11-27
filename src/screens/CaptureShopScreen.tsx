import { useAppState } from '@react-native-community/hooks';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Button, IconButton, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { Camera, PhotoFile, useCameraDevice } from 'react-native-vision-camera';
import { RootStackParamList } from '../navigation/AppStackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../state/store';
import { addVisit } from '../state/slices/visit';

type CaptureShopNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShopDetail'
>;

type CaptureScreenRouteProp = RouteProp<RootStackParamList, 'CaptureShop'>;

interface CaptureShopScreenProps {
  navigation: CaptureShopNavigationProp;
  route: CaptureScreenRouteProp;
}

const CaptureShopScreen: React.FC<CaptureShopScreenProps> = ({
  navigation,
  route,
}) => {
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === 'active';
  const cameraRef = React.useRef<Camera>(null);
  const [photo, setPhoto] = React.useState<Nullable<PhotoFile>>(null);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { shopId } = route.params;

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const p = await cameraRef.current.takePhoto({
          qualityPrioritization: 'speed',
        });
        setPhoto(p);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error Taking Picture',
          text2: error.message,
        });
      }
    }
  };

  const handleSubmitVisit = () => {
    if (!photo) {
      return;
    }
    dispatch(
      addVisit({
        filePath: photo?.path,
        storeId: shopId,
        time: new Date().toISOString(),
        fileName: photo.path.split('/').pop() || '',
      }),
    );
    navigation.goBack();
  };

  if (device == null) {
    return <Text>No Camera</Text>;
  }
  if (photo) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'flex-start',
        }}>
        <View>
          <Appbar.Header
            theme={theme}
            style={{
              backgroundColor: theme.colors.primary,
              width: '100%',
              flexDirection: 'row',
            }}>
            <Appbar.BackAction
              color="white"
              onPress={() => {
                navigation.goBack();
              }}
            />
            <Appbar.Content titleStyle={{ color: 'white' }} title="Add Visit" />
          </Appbar.Header>
          <View style={{ height: '100%' }}>
            <View
              style={{
                borderRadius: 15,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{ borderRadius: 15, width: '70%', height: '80%' }}
                source={{ uri: 'file://' + photo.path }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                bottom: 10,
                borderRadius: 10,
                marginBottom: 10,
                marginLeft: 10,
                marginRight: 10,
              }}>
              <Button
                style={{ flex: 1, marginRight: 5 }}
                icon="camera"
                mode="outlined"
                onPress={() => {
                  setPhoto(null);
                }}>
                Retake
              </Button>
              <Button
                style={{
                  flex: 1,
                  marginLeft: 5,
                }}
                icon="check"
                mode="contained"
                onPress={() => handleSubmitVisit()}>
                Add Visit
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        isActive={isActive}
        style={{ flex: 1 }}
        photo={true}
        device={device}
        ref={cameraRef}
      />
      <IconButton
        style={{
          flex: 0,
          height: 60,
          width: 60,
          borderRadius: 30,
          position: 'absolute',
          top: 0,
          backgroundColor: theme.colors.primaryContainer,
        }}
        icon="arrow-left"
        onPress={() => {
          navigation.goBack();
        }}
      />
      <TouchableOpacity
        onPress={() => {
          handleCapture();
        }}
        style={{
          flex: 1,
          height: 50,
          width: 50,
          borderRadius: 30,
          backgroundColor: theme.colors.primary,
          position: 'absolute',
          bottom: 50,
          alignSelf: 'center',
        }}
      />
    </View>
  );
};

export default CaptureShopScreen;
