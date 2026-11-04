// Shared TypeScript types for CampusLoop.

export type Role = 'Student' | 'Admin';

export type Availability = 'Available' | 'Borrowed';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
}

// The logged-in user without the password (this is what we keep in Redux).
export type SafeUser = Omit<User, 'password'>;

export interface Equipment {
  id: number;
  name: string;
  category: string;
  description: string;
  availability: Availability;
  isActive: boolean;
}

// Named BorrowRequest because "Request" is already a built-in browser type.
export interface BorrowRequest {
  id: number;
  studentId: number;
  equipmentId: number;
  purpose: string;
  expectedReturnDate: string; // format: YYYY-MM-DD
  status: RequestStatus;
}
