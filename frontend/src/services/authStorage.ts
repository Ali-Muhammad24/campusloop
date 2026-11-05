// The only place that saves and loads the logged-in user.
// It uses localStorage for now. To switch to cookies later, only this file needs to change.

import type { SafeUser } from '../types';

const STORAGE_KEY = 'campusloop_user';

export function saveUser(user: SafeUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage can be blocked (e.g. private mode). The login still works until the page is refreshed.
  }
}

// Returns null if nothing is saved or the saved data is broken.
export function loadUser(): SafeUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const user = JSON.parse(saved) as SafeUser;
    if (typeof user?.id !== 'number' || (user.role !== 'Student' && user.role !== 'Admin')) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if storage is blocked.
  }
}
