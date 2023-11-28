import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import Toast from 'react-native-toast-message';
import { cloudStorage, firestore } from '../../../utils/firebase';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import BackgroundService from 'react-native-background-actions';
import uuid from 'react-native-uuid';
import { getFormattedDate } from '../../../utils/date';
import { PURGE } from 'redux-persist';

interface Visit {
  id: string;
  name: string;
  imageUrl: string;
  time: string;
  synced: boolean;
}

export interface FileQueueItem {
  jobKey: string;
  storeId: string;
  fileName: string;
  filePath: string;
  time: string;
  uploaded: boolean;
}

export interface VisitState {
  visits: {
    [storeId: string]: {
      data: Visit[];
      lastSynced: Nullable<string>;
    };
  };
  fileQueue: FileQueueItem[];
  loading: boolean;
  error: Nullable<string>;
}

const sleep = (t: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), t));

const uploadAndSaveToFirebase = async (item: FileQueueItem, userId: string) => {
  const fileKey = item.fileName.split('/').pop()!;
  const storageRef = cloudStorage.ref(
    `${userId}/visits/${item.storeId}/${fileKey}`,
  );

  await storageRef.putFile(item.filePath);
  const url = await storageRef.getDownloadURL();
  await firestore
    .collection('users')
    .doc(userId)
    .collection('stores')
    .doc(item.storeId)
    .collection('visits')
    .add({
      name: item.fileName,
      imageUrl: url,
      time: new Date(item.time),
    });
};

export const addVisit = createAsyncThunk<
  undefined,
  {
    storeId: string;
    fileName: string;
    filePath: string;
    time: string;
  }
>(
  'visit/addVisit',
  async (
    { fileName, filePath, storeId, time },
    { getState, rejectWithValue, dispatch },
  ) => {
    try {
      const fileQueueItem: FileQueueItem = {
        jobKey: uuid.v4().toString(),
        storeId,
        fileName,
        filePath,
        time,
        uploaded: false,
      };
      dispatch(visitActions.addVisitToQueue(fileQueueItem));

      const options = {
        taskName: 'upload-background',
        taskTitle: 'Syncing Store Visits',
        taskDesc: 'Syncing your store visits in the background',
        taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
        },
      };

      const uploadFiles = async () => {
        while (BackgroundService.isRunning()) {
          const s = getState() as RootState;
          const itemsNotUploaded = s.visit.fileQueue.filter(
            item => !item.uploaded,
          );

          if (!itemsNotUploaded.length) {
            console.log('No items to upload, stopping service');
            break;
          }

          if (!s.auth.internetConnected) {
            console.log('No internet connection, waiting 5 sec');
            await sleep(5000);
            continue;
          }

          console.log('Uploading files', itemsNotUploaded);
          for (let i = 0; i < itemsNotUploaded.length; i++) {
            const item = itemsNotUploaded[i];
            try {
              await uploadAndSaveToFirebase(item, s.auth.user?.uid!);
              dispatch(visitActions.markItemComplete(item));
              console.log('Uploaded file', item.fileName);
            } catch (error) {
              // TODO: Send error to local notification
            }
          }
          await sleep(1000);
        }
        console.log('Clearing file queue');
        dispatch(visitActions.clearFileQueue());
        console.log('Stopping background service');
        BackgroundService.stop();
      };

      if (!BackgroundService.isRunning()) {
        console.log('Starting background service');
        await BackgroundService.start(uploadFiles, options);
      }

      return;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error adding visit',
        text2: error.message,
      });
      return rejectWithValue(error.message);
    }
  },
);

export const fetchVisitData = createAsyncThunk<
  { storeId: string; visits: Visit[] },
  { storeId: string }
>(
  'visit/fetchVisitData',
  async ({ storeId }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;

      const data = await firestore
        .collection('users')
        .doc(state.auth.user?.uid!)
        .collection('stores')
        .doc(storeId)
        .collection('visits')
        .orderBy('time', 'desc')
        .get();

      const visits: Visit[] = data.docs.map(doc => ({
        ...(doc.data() as Visit),
        time: (doc.data().time as FirebaseFirestoreTypes.Timestamp)
          .toDate()
          .toISOString(),
        synced: true,
      }));

      return { storeId, visits };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching visit data',
        text2: error.message,
      });
      return rejectWithValue(error.message);
    }
  },
);

const initialState: VisitState = {
  visits: {},
  loading: false,
  error: null,
  fileQueue: [],
};

const visitSlice = createSlice({
  name: 'visit',
  initialState,
  reducers: {
    addVisitToQueue: (state, action: PayloadAction<FileQueueItem>) => {
      state.visits[action.payload.storeId].data = [
        {
          id: action.payload.jobKey,
          name: `your visit at ${getFormattedDate(action.payload.time)}`,
          imageUrl: `file://${action.payload.filePath}`,
          time: action.payload.time,
          synced: false,
        },
        ...state.visits[action.payload.storeId].data,
      ];
      state.fileQueue.push(action.payload);
    },
    clearFileQueue: state => {
      state.fileQueue = state.fileQueue.filter(item => item.uploaded);
    },
    markItemComplete: (state, action: PayloadAction<FileQueueItem>) => {
      state.fileQueue.forEach((item, index) => {
        if (item.jobKey === action.payload.jobKey) {
          state.fileQueue[index].uploaded = true;
        }
      });
      state.visits[action.payload.storeId].data.forEach((item, index) => {
        if (item.id === action.payload.jobKey) {
          state.visits[action.payload.storeId].data[index].synced = true;
        }
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchVisitData.fulfilled, (state, action) => {
        const { storeId, visits } = action.payload;
        state.loading = false;
        state.visits[storeId] = { data: [], lastSynced: null };
        state.visits[storeId].data = visits;
        state.visits[storeId].lastSynced = new Date().toISOString();
      })
      .addCase(fetchVisitData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisitData.rejected, (state, action) => {
        Toast.show({
          type: 'error',
          text1: 'Error fetching visit data',
          text2: action.error.message ?? 'Could not fetch data',
        });
        state.loading = false;
        state.error = action.error.message ?? 'Could not fetch data';
      })
      .addCase(PURGE, _ => initialState);
  },
});

export default visitSlice.reducer;

export const selectVisitData = (state: RootState) => (storeId: string) => {
  return state.visit.visits[storeId] ?? [];
};

export const selectVisitState = (state: RootState) => state.visit;
export const visitActions = visitSlice.actions;
