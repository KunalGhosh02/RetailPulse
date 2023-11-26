export * from './auth';
import authReducer, { AuthState } from './auth';
import datReducer, { DataState } from './data';

export const reducers = {
  auth: authReducer,
  data: datReducer,
};

export interface ApplicationState {
  auth: AuthState;
  data: DataState;
}
