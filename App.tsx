import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppStackNavigator } from './src/navigation/AppStackNavigator';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { appStore, persistor } from './src/state/store';
import Toast from 'react-native-toast-message';
import { PersistGate } from 'redux-persist/integration/react';

function App(): JSX.Element {
  return (
    <>
      <Provider store={appStore}>
        <PersistGate persistor={persistor}>
          <PaperProvider theme={{ dark: false }}>
            <NavigationContainer>
              <AppStackNavigator />
            </NavigationContainer>
          </PaperProvider>
        </PersistGate>
      </Provider>
      <Toast />
    </>
  );
}

export default App;
