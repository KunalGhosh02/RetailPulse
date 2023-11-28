import React, { useCallback, useEffect } from 'react';
import { FlatList, Keyboard, SectionList, View } from 'react-native';
import {
  Appbar,
  Button,
  Chip,
  IconButton,
  List,
  MaterialBottomTabScreenProps,
  Modal,
  Portal,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { dataActions, fetchData, selectData } from '../state/slices/data';
import { useAppDispatch } from '../state/store';
import { RootTabParamList } from '../navigation/RootTabNavigator';
import Loader from '../components/Loader';
import { getFormattedDate } from '../../utils/date';
import { initNetInfo } from '../../utils/connectivity';
import { selectConnectivityState } from '../state/slices';
import OfflineModeBanner from '../components/OfflineRibbon';
import { debounce } from 'lodash';
import { StyleSheet } from 'react-native';

type HomeScreenNavigationProps = MaterialBottomTabScreenProps<
  RootTabParamList,
  'Home'
>;

interface HomeScreen {
  navigation: HomeScreenNavigationProps;
  route: any;
}

const styles = StyleSheet.create({
  rootView: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  appBarHeader: {
    width: '100%',
    flexDirection: 'row',
  },
  appBarContentTitle: {
    color: 'white',
  },
  appBarContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bodyWrapper: { flexDirection: 'row', marginTop: 16 },
  searchBar: {
    flex: 1,
    marginLeft: 8,
  },
  iconButton: {
    flex: 0,
    height: 60,
    width: 60,
    borderRadius: 30,
    marginTop: 0,
    marginBottom: 0,
  },
  lastSyncedText: { margin: 10 },
  shopList: { width: '100%' },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
  },
  filterChip: { margin: 5 },
  sectionHeader: {
    margin: 5,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  buttonRow: { flexDirection: 'row', marginTop: 5 },
  filterButton: { flex: 1, margin: 5 },
});

const HomeScreen: React.FC<HomeScreenNavigationProps> = ({ navigation }) => {
  const theme = useTheme();
  const connected = useSelector(selectConnectivityState);
  const { filters, data, lastSynced, loading, appliedFilters } =
    useSelector(selectData);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = React.useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dispatchSearchChange = useCallback(debounce(dispatch, 500), []);
  const [modalVisible, setModalVisible] = React.useState(false);

  const syncData = () => {
    dispatch(fetchData());
  };

  useEffect(() => {
    dispatchSearchChange(dataActions.queryData(searchQuery));
  }, [dispatch, dispatchSearchChange, modalVisible, searchQuery]);

  useEffect(() => {
    initNetInfo();
    if (!lastSynced) {
      dispatch(fetchData());
    }
  }, [dispatch, lastSynced]);

  return (
    <View style={styles.rootView}>
      <Appbar.Header
        theme={theme}
        style={{
          ...styles.appBarHeader,
          backgroundColor: theme.colors.primary,
        }}>
        <Appbar.Content
          titleStyle={styles.appBarContentTitle}
          style={styles.appBarContent}
          title="Retail Pulse"
        />
      </Appbar.Header>
      {!connected && <OfflineModeBanner />}

      <View style={styles.bodyWrapper}>
        <Searchbar
          style={styles.searchBar}
          onChangeText={text => {
            setSearchQuery(text);
          }}
          placeholder="Search"
          onClearIconPress={() => {
            setSearchQuery('');
            Keyboard.dismiss();
            dispatch(dataActions.clearSearchData());
          }}
          value={searchQuery}
        />
        <IconButton
          style={{
            ...styles.iconButton,
            backgroundColor: theme.colors.primaryContainer,
          }}
          icon="filter"
          disabled={loading}
          onPress={() => setModalVisible(true)}
        />
        <IconButton
          style={{
            ...styles.iconButton,
            backgroundColor: theme.colors.primaryContainer,
          }}
          disabled={loading || !connected}
          onPress={() => {
            setSearchQuery('');
            syncData();
          }}
          icon="sync"
        />
      </View>
      {lastSynced && !loading && (
        <Text style={styles.lastSyncedText}>
          Last Synced: {getFormattedDate(lastSynced)}
        </Text>
      )}
      {loading && <Loader />}
      {!loading && (
        <FlatList
          data={data}
          style={styles.shopList}
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
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <SectionList
            sections={filters}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item, section }) => (
              <View>
                <Chip
                  onPress={() => {
                    dispatch(
                      dataActions.applyFilters({
                        title: section.title,
                        value: item,
                      }),
                    );
                  }}
                  selected={appliedFilters[section.title].includes(item)}
                  style={styles.filterChip}>
                  {item}
                </Chip>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
          />
          <View style={styles.buttonRow}>
            <Button
              onPress={() => setModalVisible(false)}
              style={styles.filterButton}
              mode="contained">
              Done
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default HomeScreen;
