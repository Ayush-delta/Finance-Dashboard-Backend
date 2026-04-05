# 🔐 Admin Role — API Analysis Report

> **Project:** finance-backend  
> **Base URL:** `http://localhost:3000`  
> **Tested on:** 2026-04-04  
> **Admin User:** Ayush (`ayush@finance.dev`)  
> **Target User:** Raj (`raj@gmail.com`, role: `VIEWER`)

---

## 📋 Summary

| # | Operation | Endpoint | Method | Status |
|---|---|---|---|---|
| 1 | Login | `/api/auth/login` | POST | ✅ Pass |
| 2 | List all users | `/api/users` | GET | ✅ Pass |
| 3 | Create record for another user | `/api/records` | POST | ✅ Pass |
| 4 | Create own record | `/api/records` | POST | ✅ Pass |
| 5 | Update own record | `/api/records/:id` | PATCH | ✅ Pass |
| 6 | Update another user's record | `/api/records/:id` | PATCH | ✅ Pass |
| 7 | Soft-delete own record | `/api/records/:id` | DELETE | ✅ Pass |
| 8 | Soft-delete another user's record | `/api/records/:id` | DELETE | ✅ Pass |
| 9 | View soft-deleted records | `/api/records/deleted` | GET | ✅ Pass |
| 10 | Restore a soft-deleted record | `/api/records/:id/restore` | PATCH | ✅ Pass |
| 11 | Hard-delete (permanent) | `/api/records/:id/hard` | DELETE | ✅ Pass |

> **Result: 11/11 passed — All admin operations functioning correctly.**

---

## 🔑 1. Admin Login

**Purpose:** Authenticate as admin and obtain a JWT token for subsequent requests.

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayush@finance.dev","password":"password123"}'
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "cmnk9jnvk0001zwvn25pxwlvl",
      "email": "ayush@finance.dev",
      "name": "Ayush",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-04-04T11:42:41.312Z",
      "updatedAt": "2026-04-04T11:42:41.312Z"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

---

## 👥 2. List All Users

**Purpose:** Verify admin can see all registered users (admin-only endpoint).

```bash
curl -s http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "cmnk9jnvk0001zwvn25pxwlvl",
      "email": "ayush@finance.dev",
      "name": "Ayush",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-04-04T11:42:41.312Z",
      "updatedAt": "2026-04-04T11:42:41.312Z"
    },
    {
      "id": "cmnk9fv8v0000zwvnvkq5t8uk",
      "email": "raj@gmail.com",
      "name": "Raj",
      "role": "VIEWER",
      "isActive": true,
      "createdAt": "2026-04-04T11:39:44.239Z",
      "updatedAt": "2026-04-04T11:39:44.239Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 📝 3. Create Record for Another User

**Purpose:** Admin creates a financial record on behalf of Raj (VIEWER) by passing `userId` in the body.

```bash
curl -s -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01",
    "description": "April salary for Raj",
    "userId": "cmnk9fv8v0000zwvnvkq5t8uk"
  }'
```

**Response:** ✅ `201 Created`
```json
{
  "success": true,
  "message": "Financial record created.",
  "data": {
    "id": "cmnkca7w50006zwvnid70z05p",
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00Z",
    "description": "April salary for Raj",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-04T12:59:19.541Z",
    "updatedAt": "2026-04-04T12:59:19.541Z",
    "createdBy": {
      "id": "cmnk9fv8v0000zwvnvkq5t8uk",
      "name": "Raj",
      "email": "raj@gmail.com"
    }
  }
}
```

---

## 📝 4. Create Own Record

**Purpose:** Admin creates a record for themselves (no `userId` passed — defaults to self).

```bash
curl -s -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "type": "EXPENSE",
    "category": "Infrastructure",
    "date": "2026-04-02",
    "description": "Server costs"
  }'
```

**Response:** ✅ `201 Created`
```json
{
  "success": true,
  "message": "Financial record created.",
  "data": {
    "id": "cmnkcagz50007zwvnvv1c84c7",
    "amount": 10000,
    "type": "EXPENSE",
    "category": "Infrastructure",
    "date": "2026-04-02T00:00:00Z",
    "description": "Server costs",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-04T12:59:31.314Z",
    "updatedAt": "2026-04-04T12:59:31.314Z",
    "createdBy": {
      "id": "cmnk9jnvk0001zwvn25pxwlvl",
      "name": "Ayush",
      "email": "ayush@finance.dev"
    }
  }
}
```

---

## ✏️ 5. Update Own Record

**Purpose:** Admin updates their own record (amount & description).

```bash
curl -s -X PATCH http://localhost:3000/api/records/cmnkcagz50007zwvnvv1c84c7 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12000,
    "description": "Server costs - updated"
  }'
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record updated.",
  "data": {
    "id": "cmnkcagz50007zwvnvv1c84c7",
    "amount": 12000,
    "type": "EXPENSE",
    "category": "Infrastructure",
    "date": "2026-04-02T00:00:00Z",
    "description": "Server costs - updated",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-04T12:59:31.314Z",
    "updatedAt": "2026-04-04T13:00:16.XXX",
    "createdBy": {
      "id": "cmnk9jnvk0001zwvn25pxwlvl",
      "name": "Ayush",
      "email": "ayush@finance.dev"
    }
  }
}
```

---

## ✏️ 6. Update Another User's Record

**Purpose:** Admin updates Raj's record — admins can edit any user's records.

```bash
curl -s -X PATCH http://localhost:3000/api/records/cmnkca7w50006zwvnid70z05p \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 6000,
    "description": "April salary for Raj - revised"
  }'
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record updated.",
  "data": {
    "id": "cmnkca7w50006zwvnid70z05p",
    "amount": 6000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00Z",
    "description": "April salary for Raj - revised",
    "isDeleted": false,
    "deletedAt": null,
    "createdBy": {
      "id": "cmnk9fv8v0000zwvnvkq5t8uk",
      "name": "Raj",
      "email": "raj@gmail.com"
    }
  }
}
```

---

## 🗑️ 7. Soft-Delete Own Record

**Purpose:** Admin soft-deletes their own record (sets `isDeleted: true`).

```bash
curl -s -X DELETE http://localhost:3000/api/records/cmnkcagz50007zwvnvv1c84c7 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record deleted (soft).",
  "data": null
}
```

---

## 🗑️ 8. Soft-Delete Another User's Record

**Purpose:** Admin soft-deletes Raj's record — admins can delete any user's records.

```bash
curl -s -X DELETE http://localhost:3000/api/records/cmnkca7w50006zwvnid70z05p \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record deleted (soft).",
  "data": null
}
```

---

## 📂 9. View Soft-Deleted Records

**Purpose:** Admin views all soft-deleted records across all users (admin-only endpoint).

```bash
curl -s http://localhost:3000/api/records/deleted \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "cmnkca7w50006zwvnid70z05p",
      "amount": 6000,
      "type": "INCOME",
      "category": "Salary",
      "date": "2026-04-01T00:00:00Z",
      "description": "April salary for Raj - revised",
      "isDeleted": true,
      "deletedAt": "2026-04-04T13:01:11.867Z",
      "createdBy": {
        "id": "cmnk9fv8v0000zwvnvkq5t8uk",
        "name": "Raj",
        "email": "raj@gmail.com"
      }
    },
    {
      "id": "cmnkcagz50007zwvnvv1c84c7",
      "amount": 12000,
      "type": "EXPENSE",
      "category": "Infrastructure",
      "date": "2026-04-02T00:00:00Z",
      "description": "Server costs - updated",
      "isDeleted": true,
      "deletedAt": "2026-04-04T13:01:03.103Z",
      "createdBy": {
        "id": "cmnk9jnvk0001zwvn25pxwlvl",
        "name": "Ayush",
        "email": "ayush@finance.dev"
      }
    },
    {
      "id": "cmnkbgzgv0004zwvngj87xkl0",
      "amount": 5000,
      "type": "INCOME",
      "category": "Salary",
      "date": "2024-01-15T00:00:00Z",
      "description": "January salary",
      "isDeleted": true,
      "deletedAt": "2026-04-04T12:38:08.678Z",
      "createdBy": {
        "id": "cmnk9jnvk0001zwvn25pxwlvl",
        "name": "Ayush",
        "email": "ayush@finance.dev"
      }
    },
    {
      "id": "cmnk9lnar0002zwvnoq2onbnc",
      "amount": 2500,
      "type": "INCOME",
      "category": "Consulting",
      "date": "2026-04-04T00:00:00Z",
      "description": "Client payout",
      "isDeleted": true,
      "deletedAt": "2026-04-04T12:04:14.43Z",
      "createdBy": {
        "id": "cmnk9jnvk0001zwvn25pxwlvl",
        "name": "Ayush",
        "email": "ayush@finance.dev"
      }
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## ♻️ 10. Restore a Soft-Deleted Record

**Purpose:** Admin restores Raj's soft-deleted record back to active state.

```bash
curl -s -X PATCH http://localhost:3000/api/records/cmnkca7w50006zwvnid70z05p/restore \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record restored.",
  "data": {
    "id": "cmnkca7w50006zwvnid70z05p",
    "amount": 6000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00Z",
    "description": "April salary for Raj - revised",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-04-04T12:59:19.541Z",
    "updatedAt": "2026-04-04T13:01:52.192Z",
    "createdBy": {
      "id": "cmnk9fv8v0000zwvnvkq5t8uk",
      "name": "Raj",
      "email": "raj@gmail.com"
    }
  }
}
```

---

## 💀 11. Hard-Delete (Permanent)

**Purpose:** Admin permanently deletes Raj's record from the database — cannot be restored.

```bash
curl -s -X DELETE http://localhost:3000/api/records/cmnkca7w50006zwvnid70z05p/hard \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Financial record permanently deleted.",
  "data": null
}
```

---

## 🔒 Admin Permissions Matrix

| Operation | Endpoint | Method | Own Records | Other Users' Records |
|---|---|---|---|---|
| Create record | `/api/records` | POST | ✅ | ✅ (via `userId`) |
| Read records | `/api/records` | GET | ✅ | ✅ (via `?userId=`) |
| Update record | `/api/records/:id` | PATCH | ✅ | ✅ |
| Soft-delete | `/api/records/:id` | DELETE | ✅ | ✅ |
| View deleted | `/api/records/deleted` | GET | ✅ All users | ✅ All users |
| Restore deleted | `/api/records/:id/restore` | PATCH | ✅ | ✅ |
| Hard-delete | `/api/records/:id/hard` | DELETE | ✅ | ✅ |
| List users | `/api/users` | GET | — | ✅ Admin only |

---

## 🧪 Test Environment

| Property | Value |
|---|---|
| Server | `localhost:3000` |
| Database | Prisma + PostgreSQL |
| Auth | JWT Bearer tokens |
| Admin email | `ayush@finance.dev` |
| Admin ID | `cmnk9jnvk0001zwvn25pxwlvl` |
| Test user (Raj) | `cmnk9fv8v0000zwvnvkq5t8uk` |
| Date tested | 2026-04-04 |
