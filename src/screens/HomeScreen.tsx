import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import {
  Appbar,
  IconButton,
  List,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { fetchData, selectData } from '../state/slices/data';
import { useAppDispatch } from '../state/store';

const HomeScreen = () => {
  const theme = useTheme();

  const { data } = useSelector(selectData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchData());
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
          icon="filter"></IconButton>
      </View>
      <FlatList
        data={data}
        style={{ width: '100%' }}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.type}
            onPress={() => {
              // navigation.navigate('Store', {
              //   storeId: item.id,
              // });
            }}
            left={props => <List.Icon {...props} icon="store" />}
          />
        )}
      />
    </View>
  );
};

export default HomeScreen;
