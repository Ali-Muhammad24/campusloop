// The Redux store for the whole app.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { saveUser, clearUser } from '../services/authStorage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Reducers must not touch storage, so the login is saved here instead.
// It runs after every action but only saves when the user actually changed.
let lastUser = store.getState().auth.user;

store.subscribe(() => {
  const user = store.getState().auth.user;
  if (user === lastUser) return;
  lastUser = user;
  if (user) {
    saveUser(user);
  } else {
    clearUser();
  }
});
