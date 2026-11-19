// Shared TypeScript types for CampusLoop.

export type Role = 'Student' | 'Admin';

export type Availability = 'Available' | 'Borrowed';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned';

// Ids are strings because MongoDB ids look like "6af9c1f5c70a58608c05eccc".

// The logged-in user. The backend never sends the password.
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  availability: Availability;
  isActive: boolean;
}

// Named BorrowRequest because "Request" is already a built-in browser type.
// The backend also sends the student's and the item's name with each request.
export interface BorrowRequest {
  id: string;
  studentId: string;
  studentName: string;
  equipmentId: string;
  equipmentName: string;
  purpose: string;
  expectedReturnDate: string; // format: YYYY-MM-DD
  status: RequestStatus;
}
