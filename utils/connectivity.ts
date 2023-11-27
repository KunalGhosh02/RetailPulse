import NetInfo from '@react-native-community/netinfo';
import { appStore } from '../src/state/store';
import { authActions } from '../src/state/slices';

export const initNetInfo = () => {
  NetInfo.addEventListener(state => {
    appStore.dispatch(
      authActions.setInternetConnection(state.isConnected ?? true),
    );
  });
};
