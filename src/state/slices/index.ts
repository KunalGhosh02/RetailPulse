export * from './auth';
import authReducer, { AuthState } from './auth';
import datReducer, { DataState } from './data';
import visitReducer, { VisitState } from './visit';

export const reducers = {
  auth: authReducer,
  data: datReducer,
  visit: visitReducer,
};

export interface ApplicationState {
  auth: AuthState;
  data: DataState;
  visit: VisitState;
}
