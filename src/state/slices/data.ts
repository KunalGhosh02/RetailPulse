// dataSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { firestore } from '../../../utils/firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { PURGE } from 'redux-persist';

export interface Shop {
  id: string;
  address: string;
  area: string;
  name: string;
  route: string;
  type: string;
}

export interface DataState {
  data: Array<Shop>;
  originalDataForSearch: Array<Shop>;
  loading: boolean;
  error: Nullable<string>;
  progress: number;
  fetchComplete: boolean;
  lastSynced: Nullable<string>;
  filters: Array<{
    title: 'area' | 'route' | 'type';
    data: Array<string>;
  }>;
  appliedFilters: {
    area: Array<string>;
    route: Array<string>;
    type: Array<string>;
  };
}

export const fetchData = createAsyncThunk<{
  data: Array<Shop>;
  filters: DataState['filters'];
}>('data/fetchData', async (_, { getState, rejectWithValue, dispatch }) => {
  const state = getState() as RootState;

  try {
    const filterSet = new Set<string>();
    const routeSet = new Set<string>();
    const typeSet = new Set<string>();
    const batchSize = 100;
    const collectionRef = firestore
      .collection('users')
      .doc(state.auth.user?.uid!)
      .collection('stores');

    const documentSnapshots: Array<
      FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
    > = [];

    const snapshot = await collectionRef
      .limit(batchSize)
      .orderBy('name', 'asc')
      .get();

    const finalData: Array<Shop> = [];

    documentSnapshots.push(...snapshot.docs);

    let currentLength = snapshot.docs.length;

    const dataMap1 = snapshot.docs.map(doc => {
      const d = doc.data() as Omit<Shop, 'id'>;
      filterSet.add(d.area);
      routeSet.add(d.route);
      typeSet.add(d.type);
      return {
        id: doc.id,
        ...d,
      };
    });

    finalData.push(...dataMap1);
    dispatch(dataActions.setBatchProgress(documentSnapshots.length));

    while (currentLength === batchSize) {
      const lastItem = documentSnapshots[documentSnapshots.length - 1];
      const query = collectionRef
        .orderBy('name', 'asc')
        .startAfter(lastItem.data().name)
        .limit(batchSize);

      const data = await query.get();
      currentLength = data.docs.length;
      documentSnapshots.push(...data.docs);
      const dataMap2 = data.docs.map(doc => {
        const d = doc.data() as Omit<Shop, 'id'>;
        filterSet.add(d.area);
        routeSet.add(d.route);
        typeSet.add(d.type);
        return {
          id: doc.id,
          ...d,
        };
      });

      finalData.push(...dataMap2);
      dispatch(dataActions.setFetchComplete());
      dispatch(dataActions.setBatchProgress(documentSnapshots.length));
    }
    return {
      data: finalData.flat(),
      filters: [
        {
          title: 'area',
          data: Array.from(filterSet),
        },
        {
          title: 'route',
          data: Array.from(routeSet),
        },
        {
          title: 'type',
          data: Array.from(typeSet),
        },
      ],
    };
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Error fetching data',
      text2: error.message,
    });
    return rejectWithValue(error.message);
  }
});

const initialState: DataState = {
  data: [],
  loading: false,
  error: null,
  progress: 0,
  fetchComplete: false,
  lastSynced: null,
  originalDataForSearch: [],
  filters: [
    {
      title: 'area',
      data: [],
    },
    {
      title: 'route',
      data: [],
    },
    {
      title: 'type',
      data: [],
    },
  ],
  appliedFilters: {
    area: [],
    route: [],
    type: [],
  },
};

const performSearch = (stores: Array<Shop>, searchQuery: string) => {
  const normalizedSearch = searchQuery.toLowerCase();
  return stores.filter(shop =>
    shop.name.toLowerCase().includes(normalizedSearch),
  );
};

const finalizeFilters = (
  stores: Array<Shop>,
  filters: DataState['appliedFilters'],
) => {
  const { area, route, type } = filters;
  return stores.filter(shop => {
    if (area.length && !area.includes(shop.area)) {
      return false;
    }
    if (route.length && !route.includes(shop.route)) {
      return false;
    }
    if (type.length && !type.includes(shop.type)) {
      return false;
    }
    return true;
  });
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBatchProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setFetchComplete: state => {
      state.lastSynced = new Date().toISOString();
      state.loading = false;
      state.originalDataForSearch = state.data;
      state.appliedFilters = initialState.appliedFilters;
    },
    updateData: (state, action: PayloadAction<Array<Shop>>) => {
      state.data = [...state.data, ...action.payload];
    },
    queryData: (state, action: PayloadAction<string>) => {
      if (!state.originalDataForSearch.length) {
        state.originalDataForSearch = state.data;
      }

      const normalizedSearch = action.payload?.trim().toLocaleLowerCase();

      if (normalizedSearch && normalizedSearch.length > 3) {
        state.data = performSearch(
          state.originalDataForSearch,
          normalizedSearch,
        );
      } else {
        state.data = state.originalDataForSearch;
      }

      state.data = finalizeFilters(state.data, state.appliedFilters);
    },
    clearSearchData: state => {
      if (state.originalDataForSearch.length) {
        state.data = state.originalDataForSearch;
        state.data = finalizeFilters(state.data, state.appliedFilters);
      }
    },
    applyFilters: (
      state,
      action: PayloadAction<{
        title: 'area' | 'route' | 'type';
        value: string;
      }>,
    ) => {
      const { title, value } = action.payload;
      if (!state.appliedFilters[title].includes(value)) {
        state.appliedFilters[title] = [...state.appliedFilters[title], value];
      } else {
        state.appliedFilters[title] = state.appliedFilters[title].filter(
          item => item !== value,
        );
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.filters = action.payload.filters;
        state.loading = false;
      })
      .addCase(fetchData.rejected, (state, action) => {
        Toast.show({
          type: 'error',
          text1: 'Error fetching data',
          text2: action.error.message ?? 'Could not fetch data',
        });
        state.loading = false;
        state.error = action.error.message ?? 'Could not fetch data';
      })
      .addCase(PURGE, _ => initialState);
  },
});

export const dataActions = dataSlice.actions;
export const selectData = (state: RootState) => state.data;

export default dataSlice.reducer;
