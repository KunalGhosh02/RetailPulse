// dataSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { firestore } from '../../../utils/firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

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
  loading: boolean;
  error: Nullable<string>;
  progress: number;
  fetchComplete: boolean;
  lastSynced: Nullable<string>;
}

export const fetchData = createAsyncThunk(
  'data/fetchData',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const state = getState() as RootState;

    try {
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

      const dataMap1 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, 'id'>),
      }));

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
        const dataMap2 = data.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Shop, 'id'>),
        }));
        finalData.push(...dataMap2);
        dispatch(dataActions.setFetchComplete());
        dispatch(dataActions.setBatchProgress(documentSnapshots.length));
      }

      return finalData.flat();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching data',
        text2: error.message,
      });
      return rejectWithValue(error.message);
    }
  },
);

const initialState: DataState = {
  data: [],
  loading: false,
  error: null,
  progress: 0,
  fetchComplete: false,
  lastSynced: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBatchProgress: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        progress: action.payload,
      };
    },
    setFetchComplete: state => {
      return {
        ...state,
        lastSynced: new Date().toISOString(),
        loading: false,
      };
    },
    updateData: (state, action: PayloadAction<Array<Shop>>) => {
      return {
        ...state,
        data: [...state.data, ...action.payload],
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload;
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
      });
  },
});

export const dataActions = dataSlice.actions;
export const selectData = (state: RootState) => state.data;

export default dataSlice.reducer;
