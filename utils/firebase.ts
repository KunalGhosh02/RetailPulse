import rnfAuth from '@react-native-firebase/auth';
import rnfFirestore from '@react-native-firebase/firestore';
import { appStore } from '../src/state/store';
import { authActions } from '../src/state/slices';

export const auth = rnfAuth();

auth.onAuthStateChanged(next => {
  appStore.dispatch(
    authActions.setAuth({
      user: {
        email: next?.email,
        uid: next?.uid,
        metadata: {
          creationTime: next?.metadata.creationTime,
          lastSignInTime: next?.metadata.lastSignInTime,
        },
      },
      ready: true,
      authenticated: !!next?.uid,
      loading: false,
      error: null,
    }),
  );
});

export const firestore = rnfFirestore();
