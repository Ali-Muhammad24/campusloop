# 🎒 CampusLoop

A web app for borrowing campus equipment such as cameras, projectors and toolkits. Students browse equipment and send borrowing requests. An admin manages the equipment, approves or rejects requests, and records returns.

The project has two parts: a React frontend and a Node.js and Express backend that stores its data in MongoDB.

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
- Role-based access: students can't open admin pages, and the backend refuses admin actions from students
- Form validation on both the frontend and the backend, plus loading, empty, success and error messages
- Data is stored in MongoDB, so it is still there after a refresh or a restart
- Responsive layout for desktop and mobile

## 🛠️ Tech Stack

**Frontend:** React · TypeScript · Vite · Redux Toolkit · React Router · Axios · CSS (Flexbox/Grid)

**Backend:** Node.js · Express · MongoDB · Mongoose · express-session · bcryptjs

## 🚀 How to Run

You need [Node.js](https://nodejs.org) (LTS version) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed. MongoDB must be running before the backend is started.

```bash
git clone https://github.com/Ali-Muhammad24/campusloop.git
cd campusloop
```

**1. Backend** (first terminal)

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

The backend runs on `http://localhost:5000`. On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.

`npm run seed` fills the database with the demo accounts, equipment and requests. It clears the old data first, so it can be run again at any time to reset the demo.

**2. Frontend** (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

## 🔑 Demo Accounts

These accounts are created by the seed script.

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@campusloop.test     | admin123   |
| Student | student1@campusloop.test  | student123 |
| Student | student2@campusloop.test  | student123 |

Signing up on the site always creates a Student account. The Admin account only comes from the seed script.

## Backend Overview

### Folder structure

```
backend/
  server.js             Starts the app: middleware, sessions, routes and the database connection
  seed.js               Fills the database with demo data
  config/db.js          Connects to MongoDB
  models/               Mongoose models: User, Equipment and Request
  routes/               auth.js, equipment.js and requests.js
  middleware/           auth.js (login and role checks) and errorHandler.js
```

### Environment variables

These are set in `backend/.env`. The file `.env.example` contains working default values.

| Variable         | Purpose                                   |
|------------------|-------------------------------------------|
| `PORT`           | Port the backend runs on                  |
| `CLIENT_URL`     | Address of the frontend, used for CORS    |
| `MONGO_URI`      | MongoDB connection string                 |
| `SESSION_SECRET` | Secret used to sign the session cookie    |

### Data model

| Collection | Fields                                                                 |
|------------|------------------------------------------------------------------------|
| users      | name, email (unique), password (hashed), role (Student or Admin)       |
| equipment  | name, category, description, availability (Available or Borrowed), isActive |
| requests   | studentId (User), equipmentId (Equipment), purpose, expectedReturnDate, status |

A request refers to one user and one equipment item by their ids. A request status is Pending, Approved, Rejected or Returned.

### API routes

All routes start with `/api`. Errors are returned as JSON in the form `{ "message": "..." }`.

| Method | Route                     | Access    | Purpose                                         |
|--------|---------------------------|-----------|-------------------------------------------------|
| POST   | `/auth/signup`            | Public    | Create a Student account and log in             |
| POST   | `/auth/login`             | Public    | Log in and start a session                      |
| POST   | `/auth/logout`            | Logged in | End the session                                 |
| GET    | `/auth/me`                | Logged in | Return the logged-in user                       |
| GET    | `/equipment`              | Public    | List active items (the Admin also gets inactive items) |
| GET    | `/equipment/:id`          | Public    | Get one item                                    |
| POST   | `/equipment`              | Admin     | Add an item                                     |
| PUT    | `/equipment/:id`          | Admin     | Edit an item, or mark it inactive or active     |
| DELETE | `/equipment/:id`          | Admin     | Delete an item that has no requests             |
| POST   | `/requests`               | Student   | Request an available item                       |
| GET    | `/requests/mine`          | Student   | List the student's own requests                 |
| GET    | `/requests`               | Admin     | List all requests                               |
| PATCH  | `/requests/:id/approve`   | Admin     | Approve a pending request                       |
| PATCH  | `/requests/:id/reject`    | Admin     | Reject a pending request                        |
| PATCH  | `/requests/:id/return`    | Admin     | Mark an approved request as returned            |

Status codes used: 400 for invalid input, 401 when not logged in, 403 for the wrong role, 404 when a record is not found, and 409 when an action is not allowed in the current state (for example a duplicate email or an item that is already borrowed).

### Rules checked on the server

- Signup always creates a Student, and an email can only be used once.
- A request needs a purpose and a return date in the future, and the item must be active and Available.
- A student only receives their own requests.
- Only a Pending request can be approved or rejected.
- Approving a request marks the item as Borrowed. While it is Borrowed, other pending requests for the same item cannot be approved.
- Only an Approved request can be marked Returned. This makes the item Available again.
- An item that is on loan cannot be edited back to Available. It has to be marked Returned.
- An item that has requests cannot be deleted. It can be marked inactive instead, so the history is kept.

### Sessions

Logins use cookies and sessions through `express-session`. After a successful login the server stores the user's id and role in a session and sends the browser a cookie with the session id. The browser sends this cookie with every request, and the middleware uses it to check who is logged in and what their role is. Sessions are kept in the server's memory, so users need to log in again after the backend restarts. The data in MongoDB is not affected by this.

## 👥 Team

- **Muhammad Ali**: Frontend (React pages and components, Redux login state, form validation, responsive layout)
- **Abdullah Azmat**: Backend (Express API, MongoDB models, sessions, middleware, seed data) and connecting the frontend to the API
