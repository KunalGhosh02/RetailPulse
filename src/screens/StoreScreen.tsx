import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppStackNavigator';
import { Appbar, Card, FAB, List, useTheme } from 'react-native-paper';
import { useCameraPermission } from 'react-native-vision-camera';
import { useSelector } from 'react-redux';
import { fetchVisitData, selectVisitState } from '../state/slices/visit';
import { useAppDispatch } from '../state/store';
import Loader from '../components/Loader';
import Toast from 'react-native-toast-message';
import { getFormattedDate } from '../../utils/date';
import { selectConnectivityState } from '../state/slices';
import OfflineModeBanner from '../components/OfflineRibbon';

type ShopDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShopDetail'
>;
type ShopDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShopDetail'>;

interface ShopDetailProps {
  navigation: ShopDetailScreenNavigationProp;
  route: ShopDetailScreenRouteProp;
}

const ShopScreen: React.FC<ShopDetailProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const connected = useSelector(selectConnectivityState);
  const { shop } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const dispatch = useAppDispatch();
  const { visits, loading } = useSelector(selectVisitState);

  const checkPermission = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Error',
          text2: 'Camera Permission Required',
        });
        return;
      }
    }
    navigation.navigate('CaptureShop', { shopId: shop.id });
  };

  useEffect(() => {
    if (!visits[shop.id]) {
      dispatch(fetchVisitData({ storeId: shop.id }));
    } else {
      console.log('Already fetched');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
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
          <Appbar.Content
            titleStyle={{ color: 'white' }}
            title="Shop Details"
          />
        </Appbar.Header>
        {!connected && <OfflineModeBanner />}
        <View
          style={{
            marginTop: 8,
            marginRight: 8,
            marginLeft: 8,
            flexDirection: 'column',
          }}>
          <Card>
            <Card.Title title={shop.name} subtitle={shop.type} />
            <Card.Content>
              <Text>ID: {shop.id}</Text>
              <Text>Address: {shop.address}</Text>
              <Text>Area: {shop.area}</Text>
              <Text>Route: {shop.route}</Text>
            </Card.Content>
          </Card>
          <Text
            style={{
              marginTop: 8,
              marginBottom: 8,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Visits (Last Synced :{' '}
            {getFormattedDate(visits[shop.id]?.lastSynced)})
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
              style={{ width: '100%', overflow: 'scroll' }}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={`${getFormattedDate(item.time)} ${
                    item.synced ? '' : '(Not Synced)'
                  }`}
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
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => {
          checkPermission();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});

export default ShopScreen;
