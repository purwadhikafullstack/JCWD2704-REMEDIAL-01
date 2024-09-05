import { combineReducers } from 'redux';
import userSlice from './slices/user.slice';
import { configureStore } from '@reduxjs/toolkit';

const reducer = combineReducers({
  auth: userSlice,
});
const store = configureStore({
  reducer,
});

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export default store;
