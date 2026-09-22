# Day Status Management

Full-stack application for managing and viewing daily status data.

## Tech stack

- Frontend: Next.js, React and TypeScript
- Backend: Node.js, Express and TypeScript
- Database: PostgreSQL

## Project structure

```text
frontend/   Next.js application
backend/    Express REST API
```

## Setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend: `http://localhost:4000`

### Frontend

Open another terminal:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

## API health check

```text
GET http://localhost:4000/api/health
```
