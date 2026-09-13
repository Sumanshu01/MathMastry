# MathMastry

A full-stack math tutoring platform built with **React 19 + Vite** (frontend) and **Node.js + Express + PostgreSQL** (backend).

---

## 📁 Project Structure

```
mathmastry/
├── frontend/          # React 19 + Vite (runs on http://localhost:5173)
│   ├── src/
│   │   ├── admin/     # Admin panel pages
│   │   ├── teacher/   # Teacher dashboard pages
│   │   ├── pages/     # Student-facing pages
│   │   ├── components/
│   │   ├── context/   # Auth context
│   │   └── services/  # Axios API service layer
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/           # Node.js + Express + PostgreSQL (runs on http://localhost:5000)
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── validations/
    │   └── utils/
    ├── migrations/    # Knex DB migrations
    ├── seeds/         # Demo seed data
    ├── tests/         # Jest test suites
    ├── postman/       # Postman collection
    └── package.json
```

---

## 🚀 Quick Start

### 1. Setup Database
```powershell
cd backend
npm run migrate:latest   # Run DB migrations
npm run seed:run         # Seed demo data
```

### 2. Start Backend
```powershell
cd backend
npm run dev              # Starts on http://localhost:5000
```

### 3. Start Frontend
```powershell
cd frontend
npm run dev              # Starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role    | Email                         | Password      |
|---------|-------------------------------|---------------|
| Admin   | admin@mathmastry.com          | Admin123!     |
| Teacher | teacher@mathmastry.com        | Teacher123!   |
| Teacher | marcus.vance@mathmastry.com   | Teacher123!   |
| Student | student@example.com           | Student123!   |
| Student | sophia.c@example.com          | Student123!   |
| Student | liam.j@example.com            | Student123!   |

---

## 🧪 Running Tests

```powershell
cd backend
npm test     # Jest — 11 tests, 3 suites
```

---

## 🛠 Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite 8, React Router 7, Axios         |
| Backend  | Node.js, Express.js, Knex.js, PostgreSQL        |
| Auth     | JWT (httpOnly cookies), bcrypt, OTP 2FA         |
| Security | Helmet, CORS, express-rate-limit, Zod validation|
| Testing  | Jest (backend unit + integration tests)          |
