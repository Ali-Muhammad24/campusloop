// Fictional demo data. This is the ONLY place dummy data lives.
// When the backend is ready, services/api.ts will call the real API instead.

import type { User, Equipment, BorrowRequest } from '../types';

export const dummyUsers: User[] = [
  { id: 1, name: 'Demo Admin', email: 'admin@campusloop.test', password: 'admin123', role: 'Admin' },
  { id: 2, name: 'Demo Student One', email: 'student1@campusloop.test', password: 'student123', role: 'Student' },
  { id: 3, name: 'Demo Student Two', email: 'student2@campusloop.test', password: 'student123', role: 'Student' },
];

export const dummyEquipment: Equipment[] = [
  { id: 1, name: 'Dell Latitude Laptop', category: 'Laptops', description: '14-inch laptop with 16GB RAM, good for coding and assignments.', availability: 'Borrowed', isActive: true },
  { id: 2, name: 'MacBook Air', category: 'Laptops', description: '13-inch laptop, light and long battery life.', availability: 'Available', isActive: true },
  { id: 3, name: 'Canon DSLR Camera', category: 'Cameras', description: 'DSLR camera with 18-55mm lens and charger.', availability: 'Borrowed', isActive: true },
  { id: 4, name: 'GoPro Action Camera', category: 'Cameras', description: 'Small waterproof camera for sports and field work.', availability: 'Available', isActive: true },
  { id: 5, name: 'Camera Tripod', category: 'Cameras', description: 'Adjustable tripod that fits most cameras and phones.', availability: 'Available', isActive: true },
  { id: 6, name: 'Wireless Microphone Set', category: 'Audio', description: 'Two clip-on microphones with a receiver.', availability: 'Available', isActive: true },
  { id: 7, name: 'Bluetooth Speaker', category: 'Audio', description: 'Portable speaker for presentations and events.', availability: 'Available', isActive: true },
  { id: 8, name: 'Digital Multimeter', category: 'Lab Equipment', description: 'Measures voltage, current and resistance.', availability: 'Available', isActive: true },
  { id: 9, name: 'Arduino Starter Kit', category: 'Lab Equipment', description: 'Arduino board with sensors, wires and a breadboard.', availability: 'Available', isActive: true },
  { id: 10, name: 'Old Projector', category: 'Lab Equipment', description: 'Older projector, no longer lent out.', availability: 'Available', isActive: false },
];

export const dummyRequests: BorrowRequest[] = [
  // Approved: this is why the Dell laptop (id 1) is Borrowed.
  { id: 1, studentId: 2, equipmentId: 1, purpose: 'Final year project work', expectedReturnDate: '2026-11-12', status: 'Approved' },
  // Approved: this is why the Canon camera (id 3) is Borrowed.
  { id: 2, studentId: 3, equipmentId: 3, purpose: 'Photography club event', expectedReturnDate: '2026-11-09', status: 'Approved' },
  // Pending on a Borrowed item: the admin should NOT be able to approve this yet.
  { id: 3, studentId: 3, equipmentId: 1, purpose: 'Programming lab assignment', expectedReturnDate: '2026-11-20', status: 'Pending' },
  // Pending on an Available item: the admin can approve this one.
  { id: 4, studentId: 2, equipmentId: 6, purpose: 'Recording a podcast for class', expectedReturnDate: '2026-11-15', status: 'Pending' },
  { id: 5, studentId: 2, equipmentId: 4, purpose: 'Personal trip', expectedReturnDate: '2026-10-25', status: 'Rejected' },
  // Returned: the inactive projector has a request, so it can't be deleted.
  { id: 6, studentId: 3, equipmentId: 10, purpose: 'Group presentation', expectedReturnDate: '2026-10-10', status: 'Returned' },
];
