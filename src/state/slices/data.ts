// dataSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { firestore } from '../../../utils/firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface Shop {
  id: string;
  address: string;
  area: string;
  name: string;
  route: string;
  type: string;
}

export interface DataState {
  data: Array<Shop>;
  isLoading: boolean;
  error: string | null;
  progress: number;
  fetchComplete: boolean;
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

      documentSnapshots.push(...snapshot.docs);

      let currentLength = snapshot.docs.length;

      const dataMap1 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, 'id'>),
      }));

      dispatch(dataActions.updateData(dataMap1));
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
        dispatch(dataActions.updateData(dataMap2));
        dispatch(dataActions.setBatchProgress(documentSnapshots.length));
      }

      return;
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  },
);

const initialState: DataState = {
  data: [],
  isLoading: false,
  error: null,
  progress: 0,
  fetchComplete: false,
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
        isLoading: false,
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
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Could not fetch data';
      });
  },
});

export const dataActions = dataSlice.actions;
export const selectData = (state: RootState) => state.data;

export default dataSlice.reducer;
