import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import {
  Appbar,
  IconButton,
  List,
  MaterialBottomTabScreenProps,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { fetchData, selectData } from '../state/slices/data';
import { useAppDispatch } from '../state/store';
import { RootTabParamList } from '../navigation/RootTabNavigator';
import Loader from '../components/Loader';
import { getFormattedDate } from '../../utils/date';
import { initNetInfo } from '../../utils/connectivity';
import { selectConnectivityState } from '../state/slices';
import OfflineModeBanner from '../components/OfflineRibbon';

type HomeScreenNavigationProps = MaterialBottomTabScreenProps<
  RootTabParamList,
  'Home'
>;

interface HomeScreen {
  navigation: HomeScreenNavigationProps;
  route: any;
}

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({ navigation }) => {
  const theme = useTheme();
  const connected = useSelector(selectConnectivityState);
  const { data, lastSynced, loading } = useSelector(selectData);
  const dispatch = useAppDispatch();

  const syncData = () => {
    dispatch(fetchData());
  };

  useEffect(() => {
    initNetInfo();
    if (!lastSynced) {
      dispatch(fetchData());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
      <Appbar.Header
        theme={theme}
        style={{
          backgroundColor: theme.colors.primary,
          width: '100%',
          flexDirection: 'row',
        }}>
        <Appbar.Content
          titleStyle={{ color: 'white' }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          title="Retail Pulse"
        />
      </Appbar.Header>
      {!connected && <OfflineModeBanner />}

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Searchbar
          style={{
            flex: 1,
            marginLeft: 8,
          }}
          placeholder="Search"
          value=""
        />
        <IconButton
          style={{
            flex: 0,
            height: 60,
            width: 60,
            borderRadius: 30,
            marginTop: 0,
            marginBottom: 0,
            backgroundColor: theme.colors.primaryContainer,
          }}
          icon="filter"
        />
        <IconButton
          style={{
            flex: 0,
            height: 60,
            width: 60,
            borderRadius: 30,
            marginTop: 0,
            marginBottom: 0,
            backgroundColor: theme.colors.primaryContainer,
          }}
          disabled={loading || !connected}
          onPress={syncData}
          icon="sync"
        />
      </View>
      {lastSynced && !loading && (
        <Text style={{ margin: 10 }}>
          Last Synced: {getFormattedDate(lastSynced)}
        </Text>
      )}
      {loading && <Loader />}
      {!loading && (
        <FlatList
          data={data}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.type}
              onPress={() => {
                navigation.navigate('ShopDetail', {
                  shop: item,
                });
              }}
              left={props => <List.Icon {...props} icon="store" />}
            />
          )}
        />
      )}
    </View>
  );
};

export default HomeScreen;
