// Redux slice for login state: who is logged in and their role.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, SafeUser } from '../types';
import { loadUser } from '../services/authStorage';

interface AuthState {
  user: SafeUser | null;
}

// Start with the saved login (if any), so a page refresh keeps the user logged in.
const initialState: AuthState = {
  user: loadUser(),
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
