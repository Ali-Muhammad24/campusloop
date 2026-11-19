// API service. Pages call these functions instead of using axios directly,
// so this is the only file that knows the backend's URLs.

import axios from 'axios';
import type { SafeUser, Equipment, BorrowRequest } from '../types';

const http = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Send the session cookie with every request, so the backend knows who is logged in.
  withCredentials: true,
});

// The backend sends errors as { message: "..." }. This turns a failed call into a normal
// Error with that message, so pages can show error.message as before.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string') return Promise.reject(new Error(message));
      return Promise.reject(new Error('Could not reach the server. Please check that it is running.'));
    }
    return Promise.reject(error);
  },
);

// ---------- Auth ----------

export async function login(email: string, password: string): Promise<SafeUser> {
  const response = await http.post<SafeUser>('/auth/login', { email, password });
  return response.data;
}

// Signup always creates a Student account (the backend decides the role).
export async function signup(name: string, email: string, password: string): Promise<SafeUser> {
  const response = await http.post<SafeUser>('/auth/signup', { name, email, password });
  return response.data;
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout');
}

// Returns the logged-in user, or null when nobody is logged in.
// Used when the app starts, to restore the login from the session cookie.
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const response = await http.get<SafeUser>('/auth/me');
    return response.data;
  } catch {
    return null;
  }
}

// ---------- Equipment ----------

// Students and guests receive active items only. The Admin also receives inactive ones.
export async function getEquipment(): Promise<Equipment[]> {
  const response = await http.get<Equipment[]>('/equipment');
  return response.data;
}

export async function getEquipmentById(id: string): Promise<Equipment> {
  const response = await http.get<Equipment>(`/equipment/${id}`);
  return response.data;
}

export async function addEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  const response = await http.post<Equipment>('/equipment', data);
  return response.data;
}

export async function updateEquipment(id: string, data: Omit<Equipment, 'id'>): Promise<Equipment> {
  const response = await http.put<Equipment>(`/equipment/${id}`, data);
  return response.data;
}

// Items that already have requests can't be deleted; the backend refuses with a message.
export async function deleteEquipment(id: string): Promise<void> {
  await http.delete(`/equipment/${id}`);
}

// ---------- Requests ----------

// All requests (Admin only).
export async function getRequests(): Promise<BorrowRequest[]> {
  const response = await http.get<BorrowRequest[]>('/requests');
  return response.data;
}

// The logged-in student's own requests.
export async function getMyRequests(): Promise<BorrowRequest[]> {
  const response = await http.get<BorrowRequest[]>('/requests/mine');
  return response.data;
}

// The backend takes the student from the session, so only the item and the form values are sent.
export async function createRequest(
  equipmentId: string,
  purpose: string,
  expectedReturnDate: string,
): Promise<BorrowRequest> {
  const response = await http.post<BorrowRequest>('/requests', { equipmentId, purpose, expectedReturnDate });
  return response.data;
}

// Approving marks the item Borrowed.
export async function approveRequest(id: string): Promise<BorrowRequest> {
  const response = await http.patch<BorrowRequest>(`/requests/${id}/approve`);
  return response.data;
}

export async function rejectRequest(id: string): Promise<BorrowRequest> {
  const response = await http.patch<BorrowRequest>(`/requests/${id}/reject`);
  return response.data;
}

// Marking returned makes the item Available again.
export async function markReturned(id: string): Promise<BorrowRequest> {
  const response = await http.patch<BorrowRequest>(`/requests/${id}/return`);
  return response.data;
}
