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

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  appBarHeader: {
    width: '100%',
    flexDirection: 'row',
  },
  appBarContentTitle: {
    color: 'white',
  },
  bodyWrapper: { height: '100%' },
  previewImageWrapper: {
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { borderRadius: 15, width: '70%', height: '80%' },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    bottom: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  buttonLeft: { flex: 1, marginRight: 5 },
  buttonRight: {
    flex: 1,
    marginLeft: 5,
  },

  camera: { flex: 1 },
  cameraBackButton: {
    flex: 0,
    height: 60,
    width: 60,
    borderRadius: 30,
    position: 'absolute',
    top: 0,
  },
  cameraCaptureButton: {
    flex: 1,
    height: 50,
    width: 50,
    borderRadius: 30,

    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});

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
      <SafeAreaView style={styles.rootView}>
        <View>
          <Appbar.Header
            theme={theme}
            style={{
              ...styles.appBarHeader,
              backgroundColor: theme.colors.primary,
            }}>
            <Appbar.BackAction
              color="white"
              onPress={() => {
                navigation.goBack();
              }}
            />
            <Appbar.Content
              titleStyle={styles.appBarContentTitle}
              title="Add Visit"
            />
          </Appbar.Header>
          <View style={styles.bodyWrapper}>
            <View style={styles.previewImageWrapper}>
              <Image
                style={styles.previewImage}
                source={{ uri: 'file://' + photo.path }}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                style={styles.buttonLeft}
                icon="camera"
                mode="outlined"
                onPress={() => {
                  setPhoto(null);
                }}>
                Retake
              </Button>
              <Button
                style={styles.buttonRight}
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
        style={styles.camera}
        photo={true}
        device={device}
        ref={cameraRef}
      />
      <IconButton
        style={{
          ...styles.cameraBackButton,
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
          ...styles.cameraCaptureButton,
          backgroundColor: theme.colors.primary,
        }}
      />
    </View>
  );
};

export default CaptureShopScreen;
