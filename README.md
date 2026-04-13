# TaskFlow DBMS

Full-stack task management application built with React, Express, and MongoDB for task tracking, reporting, and JWT-based collaboration.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

## Features

- JWT authentication
- Task CRUD with status, priority, due date, recurrence, comments, and activity logs
- MongoDB-backed categories and assignees
- Aggregated reports for workload, category completion, and tasks completed by other users
- Stored numeric completion stats in a dedicated `CompletionStat` collection

## Project Structure

```text
client/   React frontend
server/   Express API + MongoDB models
docs/     Design notes
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally or provide a connection string:

```bash
mongod --dbpath /path/to/your/db
```

4. Seed starter categories:

```bash
npm run db:seed --workspace server
```

5. Start both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:5000`.

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/meta/categories`
- `GET /api/meta/users`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:taskId`
- `PUT /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/status`
- `DELETE /api/tasks/:taskId`
- `POST /api/tasks/:taskId/comments`
- `GET /api/tasks/reports/workload`
- `GET /api/tasks/reports/categories`
- `GET /api/tasks/reports/completed-by-others`

## Notes

- Backend validation rejects malformed input before document writes.
- Unique email enforcement is handled by MongoDB indexes.
- `CompletionStat` stores `completedCount` as a numeric field per user and powers the new report route.
- Role support is included with `admin` and `user` roles.

See [schema-notes.md](/home/appu/dbms/docs/schema-notes.md) for normalization details and ER design.
# dbms
