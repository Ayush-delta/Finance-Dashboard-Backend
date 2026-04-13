# Finance Dashboard Backend

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.x-purple)
![License](https://img.shields.io/badge/license-ISC-green)

A production-ready REST API for a finance dashboard with role-based 
access control, financial record management, and analytics.

> Live API: [https://your-render-url.onrender.com/health](https://finance-dashboard-backend-75wb.onrender.com/)
> Tech: Node.js · Express · PostgreSQL (Neon) · Prisma v7 · JWT · Zod

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js + Express | Lightweight, explicit routing, great middleware ecosystem |
| Database | PostgreSQL (Neon) | Scalable relational database, serverless architecture |
| ORM | Prisma | Type-safe queries, migrations, `@prisma/adapter-pg` driver |
| Auth | JWT (jsonwebtoken) | Stateless, role encoded in payload for fast middleware checks |
| Validation | Zod | Schema-first, coerces types (strings to dates), reusable across layers |
| Password hashing | bcryptjs | Industry standard, timing-safe |
| Security | helmet, cors, express-rate-limit | Standard Express security hardening |
| Testing | Jest + Supertest | Integration tests against real PostgreSQL DB |

---

## Project Structure

```
finance-backend/
├── prisma/
│   └── schema.prisma              # Database schema (User, FinancialRecord)
├── src/
│   ├── __tests__/
│   │   ├── auth.test.js           # 12 integration test cases
│   │   ├── records.test.js        # 14 integration test cases
│   │   └── dashboard.test.js      # 8 integration test cases
│   ├── controllers/               # Parse req/res, call service, return response
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── record.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verify + live DB user lookup
│   │   ├── role.middleware.js     # requireRole / requireMinRole guards
│   │   ├── validate.middleware.js # Zod validation factory
│   │   └── error.middleware.js    # Global error handler + 404
│   ├── prisma/
│   │   ├── client.js              # Prisma singleton
│   │   └── seed.js                # Demo data: 3 users + 36 records
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── record.routes.js
│   │   └── dashboard.routes.js
│   ├── schemas/                   # Zod schemas (single source of validation truth)
│   │   ├── auth.schema.js
│   │   ├── user.schema.js
│   │   └── record.schema.js
│   ├── services/                  # All business logic lives here
│   │   ├── auth.service.js        # Register, login, JWT signing
│   │   ├── user.service.js        # CRUD, role assign, activate/deactivate
│   │   ├── record.service.js      # CRUD, filtering, soft/hard delete, restore
│   │   └── dashboard.service.js   # Summary, trends, category breakdown, range
│   ├── utils/
│   │   ├── errors.js              # AppError + 5 typed subclasses
│   │   ├── response.js            # Consistent {success, message, data} shape
│   │   └── pagination.js          # Parse query params + build pagination meta
│   ├── app.js                     # Express app: middleware stack + route mounting
│   └── server.js                  # Entry point: DB connect, listen, graceful shutdown
├── prisma.config.ts               # Prisma datasource configuration
├── .env
├── .env.example
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update your `.env` with your PostgreSQL (e.g., Neon) connection string.

### 3. Create the database and generate Prisma client

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed demo data

```bash
npm run db:seed
```

Creates 3 users (one per role) and 36 financial records across 6 months.

### 5. Start the server

```bash
npm run dev      # Development with auto-reload
npm start        # Production
```

Server runs at `http://localhost:3000`

Check it is alive:
```bash
curl http://localhost:3000/health
```

### 6. Run tests

```bash
npm test
```

---

## Demo Credentials

All passwords: `password123`

| Email | Role | Permissions |
|---|---|---|
| [EMAIL_ADDRESS] | ADMIN | Full access |
| [EMAIL_ADDRESS] | ANALYST | View + create/edit own records + dashboard |
| [EMAIL_ADDRESS] | VIEWER | View records only |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | none | PostgreSQL connection string (`postgresql://user:pass@host/db`) |
| `JWT_SECRET` | *(change this!)* | Long random string. Must be set before deploying. |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | `production` hides stack traces from error responses |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins for production |

---

## Role Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| Register / login | yes | yes | yes |
| View own profile | yes | yes | yes |
| List all users | no | no | yes |
| Update any user | no | no | yes |
| Assign roles | no | no | yes |
| Activate / deactivate users | no | no | yes |
| View financial records | yes | yes | yes |
| Create records | no | yes | yes |
| Edit records | no | own only | any |
| Soft delete records | no | own only | any |
| Restore deleted records | no | no | yes |
| Hard delete records | no | no | yes |
| View deleted records | no | no | yes |
| Access dashboard analytics | no | yes | yes |

---

## API Reference

### Authentication header

```
Authorization: Bearer <token>
```

### Response envelope

All responses share this shape:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Paginated responses add a `pagination` key:

```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Validation error responses include field-level detail:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "amount", "message": "Amount must be positive" }
  ]
}
```

---

### Auth endpoints

#### POST /api/auth/register

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "securepassword",
  "role": "VIEWER"
}
```

`role` is optional and defaults to `VIEWER`.

Response `201`:
```json
{
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "VIEWER" },
    "token": "eyJ..."
  }
}
```

---

#### POST /api/auth/login

```json
{ "email": "user@example.com", "password": "securepassword" }
```

Response `200`: same shape as register.

---

#### GET /api/auth/me

Returns the currently authenticated user. No body needed.

---

### User endpoints (Admin only except own profile)

#### GET /api/users

Query params: `role`, `isActive` (`true`/`false`), `page`, `limit`

#### GET /api/users/:id

Admins can fetch any user. Other roles can only fetch themselves.

#### PATCH /api/users/:id

Admins can update `name`, `email`, `isActive`. Non-admins can only update their own `name`.

#### PATCH /api/users/:id/role

```json
{ "role": "ANALYST" }
```

#### PATCH /api/users/:id/toggle-status

Flips `isActive`. Cannot toggle your own account.

#### DELETE /api/users/:id

Permanently removes the user. Cannot delete yourself.

---

### Record endpoints

#### GET /api/records

Available to all roles. Soft-deleted records are excluded.

| Param | Example | Description |
|---|---|---|
| `type` | `INCOME` | Filter by `INCOME` or `EXPENSE` |
| `category` | `Salary` | Partial match |
| `userId` | `cuid` | Filter records by a specific User ID |
| `startDate` | `2024-01-01` | Records on or after |
| `endDate` | `2024-12-31` | Records on or before |
| `sortBy` | `amount` | `date` (default), `amount`, `createdAt` |
| `order` | `asc` | `asc` or `desc` (default) |
| `page` | `2` | Default 1 |
| `limit` | `50` | Default 20, max 100 |

#### GET /api/records/:id

#### POST /api/records — Analyst, Admin

```json
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-01-15",
  "description": "January salary",
  "userId": "cuid" 
}
```

> **Note**: The `userId` field is optional. If provided, the system (if authorized via ADMIN role) will create the record on behalf of that user. Otherwise, the record defaults to the authenticated creator.

#### PATCH /api/records/:id — Analyst (own), Admin (any)

All fields optional.

#### DELETE /api/records/:id — Analyst (own), Admin (any)

Soft delete. Record disappears from normal listing but is restorable.

#### GET /api/records/deleted — Admin only

Lists all soft-deleted records.

#### PATCH /api/records/:id/restore — Admin only

Restores a soft-deleted record.

#### DELETE /api/records/:id/hard — Admin only

Permanently removes the record from the database.

---

### Dashboard endpoints — Analyst, Admin

> **Note on Scoping**: All dashboard endpoints support an optional `?userId=` query parameter to filter analytics to a single user.

#### GET /api/dashboard/summary

```json
{
  "data": {
    "totalIncome": 45000.00,
    "totalExpenses": 12500.00,
    "netBalance": 32500.00,
    "totalRecords": 36,
    "incomeCount": 18,
    "expenseCount": 18,
    "recentActivity": []
  }
}
```

#### GET /api/dashboard/categories?type=INCOME

Groups totals by category. `type` is optional.

```json
{
  "data": [
    { "category": "Salary", "type": "INCOME", "total": 30000.00, "count": 6 }
  ]
}
```

#### GET /api/dashboard/trends/monthly?months=12

Monthly income vs expenses for the last N months (default 12, max 60).

```json
{
  "data": [
    { "month": "2024-01", "income": 5800.00, "expenses": 2000.00, "net": 3800.00 }
  ]
}
```

#### GET /api/dashboard/trends/weekly?weeks=8

Weekly breakdown. Default 8 weeks, max 52.

#### GET /api/dashboard/top-categories?limit=5&type=EXPENSE

Top N categories by total. `type` optional.

#### GET /api/dashboard/range-summary?startDate=2024-01-01&endDate=2024-03-31

Summary for an arbitrary date range.

```json
{
  "data": {
    "period": { "startDate": "2024-01-01", "endDate": "2024-03-31" },
    "totalIncome": 18000.00,
    "totalExpenses": 4500.00,
    "netBalance": 13500.00,
    "incomeCount": 9,
    "expenseCount": 9
  }
}
```

---

## HTTP Status Codes

| Code | When |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 401 | Missing, invalid, or expired token |
| 403 | Valid token but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation error (with `errors` array) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

## Design Decisions and Tradeoffs

Please refer to [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for a detailed breakdown of the role model, soft deletion mechanics, authentication tradeoffs, database choices, and validation algorithms.

---

## Production Checklist

- Set `NODE_ENV=production`
- Set a long random `JWT_SECRET` (32+ characters)
- Set `ALLOWED_ORIGINS` to your frontend domain
- Run behind a reverse proxy (nginx) for TLS
- Use `pm2` or Docker for process management
