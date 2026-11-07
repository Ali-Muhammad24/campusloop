// The page each role lands on after logging in (and when sent "home").

import type { Role } from '../types';

export function getHomePath(role: Role): string {
  return role === 'Admin' ? '/admin/dashboard' : '/';
}
