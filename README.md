# 🎒 CampusLoop

A web app for borrowing campus equipment such as cameras, projectors and toolkits. Students browse equipment and send borrowing requests. An admin manages the equipment, approves or rejects requests, and records returns.

> **Phase 1:** this version contains the complete **frontend**. It runs on dummy data for now; the backend (Node.js, Express and a database) will be connected in the next phase.

## ✨ Features

**Students**
- Sign up, log in and log out
- Browse equipment, search by name, and filter by category or availability
- View item details and request an available item (purpose + return date)
- Track their own requests and their status

**Admin**
- Add, edit, delete or mark equipment inactive
- Approve or reject pending requests, and mark items as returned
- See counts of available and borrowed items

**General**
- Role-based access: students can't open admin pages
- Form validation, plus loading, empty, success and error messages
- Responsive layout for desktop and mobile

## 🛠️ Tech Stack

React · TypeScript · Vite · Redux Toolkit · React Router · Axios · CSS (Flexbox/Grid)

## 🚀 How to Run

You need [Node.js](https://nodejs.org) (LTS version) installed.

```bash
git clone https://github.com/Ali-Muhammad24/campusloop.git
cd campusloop/frontend
npm install
npm run dev
```

Then open the link shown in the terminal (usually `http://localhost:5173`).

> Changes like new signups or requests are kept in memory only, so they reset when the page is refreshed. This will change once the backend is connected.

## 🔑 Demo Accounts

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@campusloop.test     | admin123   |
| Student | student1@campusloop.test  | student123 |
| Student | student2@campusloop.test  | student123 |

## 👥 Team

- **Muhammad Ali**: Frontend
- **Abdullah Azmat**: Backend
