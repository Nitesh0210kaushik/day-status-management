# Day Status Management

A full-stack application for recording daily status notes in an authenticated dashboard and viewing them through a public calendar.

## Features

- Public calendar to view the status for any selected date.
- Authenticated dashboard with monthly calendar and annual matrix views.
- Create or update a status for valid calendar days only.
- Year and month selection; leap years and months with fewer than 31 days are handled correctly.
- Secure cookie-based authentication with access and refresh tokens.
- Request validation, rate limiting, Helmet security headers, CSRF protection, and API error handling.

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL

## Project structure

```text
frontend/   Next.js client application
backend/    Express REST API and Prisma schema
```

## Prerequisites

- Node.js 20 or newer
- PostgreSQL server installed and running locally (default port: `5432`)

pgAdmin is optional and can be used to create or inspect the database. It does not run the PostgreSQL server by itself.

## Run locally

### 1. Configure and run the backend

```powershell
cd backend
copy .env.example .env
```

Update `DATABASE_URL` and `JWT_SECRET` in `backend/.env`.

Create the database once from pgAdmin Query Tool (or any PostgreSQL client):

```sql
CREATE DATABASE day_status_management;
```

Then run these commands in order:

```powershell
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

- `npm install` installs backend dependencies.
- `npm run prisma:generate` creates the Prisma client.
- `npm run prisma:deploy` creates/updates the database tables from committed migrations.
- `npm run dev` starts the backend API.

The API runs at `http://localhost:4000`.

### 2. Configure and run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Main routes

- `/viewer` — public day status calendar
- `/register` — create an account
- `/login` — sign in
- `/admin` — protected status management dashboard

## API

API base URL: `http://localhost:4000/api/v1`

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /day-status?year=2026&month=9`
- `GET /day-status?year=2026`
- `GET /day-status/:date`
- `PUT /day-status/:date` (authenticated)

## Verify

```powershell
cd backend
npm run typecheck
npm test
npm run build

cd ../frontend
npm run lint
npm run build
```

## Environment files

Do not commit `backend/.env` or `frontend/.env.local`. Use the included `.env.example` files as templates.
