// Mock API service. Pages call these functions instead of touching dummy data directly.
// Later, each function body can be replaced with a real API call (e.g. axios) without
// changing the pages. Changes are kept in memory, so they reset when the page is refreshed.

import type { User, SafeUser, Equipment, BorrowRequest } from '../types';
import { dummyUsers, dummyEquipment, dummyRequests } from '../data/dummyData';

const DELAY_MS = 500;

// Copies so the original dummy data is never changed.
let users: User[] = dummyUsers.map((u) => ({ ...u }));
let equipment: Equipment[] = dummyEquipment.map((e) => ({ ...e }));
let requests: BorrowRequest[] = dummyRequests.map((r) => ({ ...r }));

// Waits a little, like a real network call, so loading indicators can be shown.
function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

function removePassword(user: User): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function findEquipment(id: number): Equipment {
  const item = equipment.find((e) => e.id === id);
  if (!item) throw new Error('Equipment not found.');
  return item;
}

function findRequest(id: number): BorrowRequest {
  const request = requests.find((r) => r.id === id);
  if (!request) throw new Error('Request not found.');
  return request;
}

// ---------- Auth ----------

export async function login(email: string, password: string): Promise<SafeUser> {
  await wait();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!user) throw new Error('Incorrect email or password.');
  return removePassword(user);
}

// Signup always creates a Student account.
export async function signup(name: string, email: string, password: string): Promise<SafeUser> {
  await wait();
  const cleanEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser: User = { id: nextId(users), name: name.trim(), email: cleanEmail, password, role: 'Student' };
  users = [...users, newUser];
  return removePassword(newUser);
}

export async function getUsers(): Promise<SafeUser[]> {
  await wait();
  return users.map(removePassword);
}

// ---------- Equipment ----------

export async function getEquipment(): Promise<Equipment[]> {
  await wait();
  return equipment.map((e) => ({ ...e }));
}

export async function getEquipmentById(id: number): Promise<Equipment> {
  await wait();
  return { ...findEquipment(id) };
}

export async function addEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
  await wait();
  const newItem: Equipment = { ...data, id: nextId(equipment) };
  equipment = [...equipment, newItem];
  return { ...newItem };
}

export async function updateEquipment(id: number, data: Omit<Equipment, 'id'>): Promise<Equipment> {
  await wait();
  findEquipment(id);
  const updated: Equipment = { ...data, id };
  equipment = equipment.map((e) => (e.id === id ? updated : e));
  return { ...updated };
}

// Items that already have requests can't be deleted; mark them inactive instead.
export async function deleteEquipment(id: number): Promise<void> {
  await wait();
  findEquipment(id);
  if (requests.some((r) => r.equipmentId === id)) {
    throw new Error('This item has requests, so it cannot be deleted. Mark it inactive instead.');
  }
  equipment = equipment.filter((e) => e.id !== id);
}

// ---------- Requests ----------

export async function getRequests(): Promise<BorrowRequest[]> {
  await wait();
  return requests.map((r) => ({ ...r }));
}

export async function getRequestsByStudent(studentId: number): Promise<BorrowRequest[]> {
  await wait();
  return requests.filter((r) => r.studentId === studentId).map((r) => ({ ...r }));
}

export async function createRequest(
  studentId: number,
  equipmentId: number,
  purpose: string,
  expectedReturnDate: string,
): Promise<BorrowRequest> {
  await wait();
  const item = findEquipment(equipmentId);
  if (!item.isActive || item.availability !== 'Available') {
    throw new Error('This item is not available right now.');
  }
  const newRequest: BorrowRequest = {
    id: nextId(requests),
    studentId,
    equipmentId,
    purpose: purpose.trim(),
    expectedReturnDate,
    status: 'Pending',
  };
  requests = [...requests, newRequest];
  return { ...newRequest };
}

function setStatus(id: number, status: BorrowRequest['status']): BorrowRequest {
  const updated: BorrowRequest = { ...findRequest(id), status };
  requests = requests.map((r) => (r.id === id ? updated : r));
  return { ...updated };
}

function setAvailability(equipmentId: number, availability: Equipment['availability']): void {
  equipment = equipment.map((e) => (e.id === equipmentId ? { ...e, availability } : e));
}

// Approving marks the item Borrowed. An item that is already Borrowed can't be approved again.
export async function approveRequest(id: number): Promise<BorrowRequest> {
  await wait();
  const request = findRequest(id);
  if (request.status !== 'Pending') throw new Error('Only pending requests can be approved.');
  if (findEquipment(request.equipmentId).availability === 'Borrowed') {
    throw new Error('This item is currently borrowed. Wait until it is returned.');
  }
  setAvailability(request.equipmentId, 'Borrowed');
  return setStatus(id, 'Approved');
}

export async function rejectRequest(id: number): Promise<BorrowRequest> {
  await wait();
  if (findRequest(id).status !== 'Pending') throw new Error('Only pending requests can be rejected.');
  return setStatus(id, 'Rejected');
}

// Marking returned makes the item Available again.
export async function markReturned(id: number): Promise<BorrowRequest> {
  await wait();
  const request = findRequest(id);
  if (request.status !== 'Approved') throw new Error('Only approved requests can be marked returned.');
  setAvailability(request.equipmentId, 'Available');
  return setStatus(id, 'Returned');
}
