import React, { useEffect } from 'react';
import { View, Text, FlatList, Linking, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppStackNavigator';
import {
  Appbar,
  Button,
  Card,
  FAB,
  List,
  Modal,
  Portal,
  useTheme,
} from 'react-native-paper';
import { useCameraPermission } from 'react-native-vision-camera';
import { useSelector } from 'react-redux';
import { fetchVisitData, selectVisitState } from '../state/slices/visit';
import { useAppDispatch } from '../state/store';
import Loader from '../components/Loader';
import Toast from 'react-native-toast-message';
import { getFormattedDate } from '../../utils/date';
import { selectConnectivityState } from '../state/slices';
import OfflineModeBanner from '../components/OfflineRibbon';
import { SafeAreaView } from 'react-native-safe-area-context';

type ShopDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShopDetail'
>;
type ShopDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShopDetail'>;

interface ShopDetailProps {
  navigation: ShopDetailScreenNavigationProp;
  route: ShopDetailScreenRouteProp;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  rootView: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  appBarHeader: {
    width: '100%',
    flexDirection: 'row',
  },
  appBarContent: {
    color: 'white',
  },
  bodyWrapper: {
    marginTop: 8,
    marginRight: 8,
    marginLeft: 8,
    flexDirection: 'column',
  },
  listHeader: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  listStyle: { width: '100%', marginBottom: 70 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
  },
  permissionText: { textAlign: 'center', marginBottom: 5 },
  modalButtonWrapper: { flexDirection: 'row', marginTop: 5 },
  buttonStyle: { flex: 1, margin: 5 },
});

const ShopScreen: React.FC<ShopDetailProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const connected = useSelector(selectConnectivityState);
  const { shop } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const dispatch = useAppDispatch();
  const { visits, loading } = useSelector(selectVisitState);
  const [modalVisible, setModalVisible] = React.useState(false);

  const checkPermission = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Error',
          text2: 'Camera Permission Required',
        });
        setModalVisible(true);
        return;
      }
    }
    navigation.navigate('CaptureShop', { shopId: shop.id });
  };

  useEffect(() => {
    if (!visits[shop.id]) {
      dispatch(fetchVisitData({ storeId: shop.id }));
    }
  }, [dispatch, shop.id, visits]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.rootView}>
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
            titleStyle={styles.appBarContent}
            title="Shop Details"
          />
        </Appbar.Header>
        {!connected && <OfflineModeBanner />}
        <View style={styles.bodyWrapper}>
          <Card>
            <Card.Title title={shop.name} subtitle={shop.type} />
            <Card.Content>
              <Text>ID: {shop.id}</Text>
              <Text>Address: {shop.address}</Text>
              <Text>Area: {shop.area}</Text>
              <Text>Route: {shop.route}</Text>
            </Card.Content>
          </Card>
          <Text style={styles.listHeader}>
            Visits
            {loading && ' (Syncing)'}
            {visits[shop.id].lastSynced &&
              ` (Last Synced : ${getFormattedDate(
                visits[shop.id]?.lastSynced,
              )})`}
          </Text>
          {loading && <Loader />}
          {!loading && visits[shop.id]?.data.length === 0 && (
            <View>
              <Text>No Visits</Text>
            </View>
          )}
          {!loading && (
            <FlatList
              nestedScrollEnabled
              data={visits[shop.id]?.data}
              style={styles.listStyle}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={`${getFormattedDate(item.time)} ${
                    item.synced ? '' : '(Not Synced)'
                  }`}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ opacity: item.synced ? 1 : 0.5 }}
                  left={() => (
                    <List.Image
                      style={{ borderRadius: 15 }}
                      source={{ uri: item.imageUrl }}
                    />
                  )}
                />
              )}
            />
          )}
        </View>
      </View>
      <FAB
        icon="plus"
        label="Add Visit"
        style={styles.fab}
        onPress={() => {
          checkPermission();
        }}
      />
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <Text style={styles.permissionText}>
            This feature requires you to use the camera to capture image. Please
            enable camera permission from settings.
          </Text>
          <View style={styles.modalButtonWrapper}>
            <Button
              onPress={() => setModalVisible(false)}
              style={styles.buttonStyle}
              mode="outlined">
              Cancel
            </Button>
            <Button
              onPress={() => {
                setModalVisible(false);
                Linking.openSettings();
              }}
              style={styles.buttonStyle}
              mode="contained">
              Go to Settings
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

export default ShopScreen;
