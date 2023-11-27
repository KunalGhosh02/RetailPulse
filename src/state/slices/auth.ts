import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { auth } from '../../../utils/firebase';
import { RootState } from '../store';
import Toast from 'react-native-toast-message';

interface User {
  uid: Nullable<string>;
  email: Nullable<string>;
  metadata: {
    creationTime: Nullable<string>;
    lastSignInTime: Nullable<string>;
  };
}

export interface AuthState {
  internetConnected: boolean;
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  ready: boolean;
  error: string | null;
}

const initialState: AuthState = {
  internetConnected: true,
  user: null,
  loading: false,
  authenticated: false,
  ready: false,
  error: null,
};

export const signInWithFirebase = createAsyncThunk<
  User,
  { email: string; password: string }
>('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await auth.signInWithEmailAndPassword(email, password);
    return {
      uid: response.user?.uid,
      email: response.user?.email,
      metadata: {
        creationTime: response.user?.metadata.creationTime,
        lastSignInTime: response.user?.metadata.lastSignInTime,
      },
    };
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Error Signing In',
      text2: error.message,
      position: 'top',
    });
    return rejectWithValue(error.message);
  }
});

export const signOutWithFirebase = createAsyncThunk<void, void>(
  'auth/signOut',
  async () => await auth.signOut(),
);

const authSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setInternetConnection: (state, action: PayloadAction<boolean>) => {
      state.internetConnected = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signInWithFirebase.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithFirebase.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(signInWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signOutWithFirebase.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOutWithFirebase.fulfilled, state => {
        state.user = null;
        state.loading = false;
      })
      .addCase(signOutWithFirebase.rejected, (state, action) => {
        Toast.show({
          type: 'error',
          text1: 'Error Signing Out',
          text2: action.payload as string,
        });
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const authActions = authSlice.actions;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.authenticated;
export const selectUserData = (state: RootState) => state.auth.user;
export const selectAuth = (state: RootState) => state.auth;
export const selectConnectivityState = (state: RootState) =>
  state.auth.internetConnected;

export default authSlice.reducer;
