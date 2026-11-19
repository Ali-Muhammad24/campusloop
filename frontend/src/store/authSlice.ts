// Redux slice for login state: who is logged in and their role.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, SafeUser } from '../types';

interface AuthState {
  user: SafeUser | null;
}

// Nobody is logged in at first. main.tsx asks the backend who is logged in
// (using the session cookie) before the app is shown, so a refresh keeps the login.
const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<SafeUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors. The role comes from the user, so it is never stored twice.
// (A plain state type is used here to avoid importing from store.ts, which imports this file.)
type StateWithAuth = { auth: AuthState };

export const selectUser = (state: StateWithAuth): SafeUser | null => state.auth.user;
export const selectRole = (state: StateWithAuth): Role | null => state.auth.user?.role ?? null;
export const selectIsLoggedIn = (state: StateWithAuth): boolean => state.auth.user !== null;
