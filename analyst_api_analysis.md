# 📊 Analyst Role — API Analysis Report

> **Project:** finance-backend  
> **Base URL:** `http://localhost:3000`  
> **Tested on:** 2026-04-04  
> **Analyst User:** Analyst User (`analyst@finance.dev`, ID: `cmnkm23fi000z8svnu1ph4kmo`)

---

## 👥 Test Users Created

| Name | Email | Role | User ID |
|---|---|---|---|
| Priya Sharma | priya@finance.dev | VIEWER | `cmnkluzsb000150vnf3k3s4id` |
| Vikram Patel | vikram@finance.dev | VIEWER | `cmnklv093000250vnq5oy32mc` |
| Neha Gupta | neha@finance.dev | VIEWER | `cmnklv0o7000350vnwgb96b9k` |
| Arjun Singh | arjun@finance.dev | VIEWER | `cmnklv13h000450vno8k121ic` |
| Meera Joshi | meera@finance.dev | VIEWER | `cmnklv1ij000550vnlr27ux56` |

---

## 💰 Seeded Financial Records (34 total)

### Priya Sharma — 6 records
| Type | Category | Amount (₹) | Date |
|---|---|---|---|
| INCOME | Salary | 75,000 | 2026-03-01 |
| EXPENSE | Rent | 15,000 | 2026-03-05 |
| EXPENSE | Groceries | 3,000 | 2026-03-10 |
| EXPENSE | Shopping | 5,000 | 2026-03-15 |
| INCOME | Freelance | 10,000 | 2026-03-20 |
| EXPENSE | Entertainment | 2,000 | 2026-04-01 |

### Vikram Patel — 7 records
| Type | Category | Amount (₹) | Date |
|---|---|---|---|
| INCOME | Salary | 1,20,000 | 2026-03-01 |
| EXPENSE | Rent | 25,000 | 2026-03-03 |
| EXPENSE | Utilities | 8,000 | 2026-03-07 |
| INCOME | Investments | 15,000 | 2026-03-12 |
| EXPENSE | Groceries | 6,000 | 2026-03-18 |
| EXPENSE | Travel | 20,000 | 2026-03-25 |
| EXPENSE | Healthcare | 4,500 | 2026-04-02 |

### Neha Gupta — 7 records
| Type | Category | Amount (₹) | Date |
|---|---|---|---|
| INCOME | Salary | 90,000 | 2026-03-01 |
| EXPENSE | Rent | 18,000 | 2026-03-02 |
| INCOME | Freelance | 12,000 | 2026-03-08 |
| EXPENSE | Shopping | 7,000 | 2026-03-12 |
| EXPENSE | Food | 3,500 | 2026-03-16 |
| EXPENSE | Education | 5,000 | 2026-03-22 |
| EXPENSE | Entertainment | 2,500 | 2026-04-03 |

### Arjun Singh — 7 records
| Type | Category | Amount (₹) | Date |
|---|---|---|---|
| INCOME | Salary | 60,000 | 2026-03-01 |
| EXPENSE | Rent | 10,000 | 2026-03-04 |
| EXPENSE | Groceries | 4,000 | 2026-03-09 |
| INCOME | Freelance | 25,000 | 2026-03-14 |
| EXPENSE | Gadgets | 8,000 | 2026-03-19 |
| EXPENSE | Food | 3,000 | 2026-03-28 |
| EXPENSE | Travel | 15,000 | 2026-04-01 |

### Meera Joshi — 8 records
| Type | Category | Amount (₹) | Date |
|---|---|---|---|
| INCOME | Salary | 95,000 | 2026-03-01 |
| EXPENSE | Rent | 20,000 | 2026-03-03 |
| EXPENSE | Groceries | 5,000 | 2026-03-06 |
| INCOME | Consulting | 30,000 | 2026-03-11 |
| EXPENSE | Healthcare | 12,000 | 2026-03-17 |
| EXPENSE | Shopping | 8,000 | 2026-03-23 |
| EXPENSE | Utilities | 6,000 | 2026-03-30 |
| EXPENSE | Entertainment | 4,000 | 2026-04-04 |

---

## 📋 Test Results Summary

| # | Test | Endpoint | Status |
|---|---|---|---|
| 1 | Overall summary (all users) | `/api/dashboard/summary` | ✅ Pass |
| 2 | Per-user summaries (5 users) | `/api/dashboard/summary?userId=` | ✅ Pass |
| 3 | Category breakdown (EXPENSE) | `/api/dashboard/categories?type=EXPENSE` | ✅ Pass |
| 4 | Arjun's expense categories | `/api/dashboard/categories?type=EXPENSE&userId=` | ✅ Pass |
| 5 | Top 5 expense categories | `/api/dashboard/top-categories?type=EXPENSE&limit=5` | ✅ Pass |
| 6 | Meera's monthly trends | `/api/dashboard/trends/monthly?userId=` | ✅ Pass |
| 7 | Neha's records (date sorted) | `/api/records?userId=&sortBy=date&order=asc` | ✅ Pass |
| 8 | Range summary (March 2026) | `/api/dashboard/range-summary?startDate=&endDate=` | ✅ Pass |
| 9 | Vikram's range summary | `/api/dashboard/range-summary?...&userId=` | ✅ Pass |

> **Result: 9/9 passed — All analyst operations functioning correctly.**

---

## 🔑 Step 0: Login as Analyst

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@finance.dev","password":"password123"}'
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmnkm23fi000z8svnu1ph4kmo",
      "email": "analyst@finance.dev",
      "name": "Analyst User",
      "role": "ANALYST"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

> [!NOTE]
> Save the token as `$TOKEN` for all subsequent requests.

---

## 📊 Test 1: Overall Summary (All Users)

**Purpose:** Get aggregate financial data across all users.

```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "success": true,
  "message": "Dashboard summary.",
  "data": {
    "totalIncome": 612000,
    "totalExpenses": 219500,
    "netBalance": 392500,
    "totalRecords": 38,
    "incomeCount": 13,
    "expenseCount": 25,
    "recentActivity": [
      { "amount": 10000, "type": "INCOME", "category": "SOFTWARE", "date": "2026-04-04", "createdBy": { "name": "Ayush" } },
      { "amount": 4000, "type": "EXPENSE", "category": "Entertainment", "date": "2026-04-04", "createdBy": { "name": "Meera Joshi" } },
      { "amount": 2500, "type": "EXPENSE", "category": "Entertainment", "date": "2026-04-03", "createdBy": { "name": "Neha Gupta" } },
      { "amount": 4500, "type": "EXPENSE", "category": "Healthcare", "date": "2026-04-02", "createdBy": { "name": "Vikram Patel" } },
      { "amount": 2000, "type": "EXPENSE", "category": "Entertainment", "date": "2026-04-01", "createdBy": { "name": "Priya Sharma" } }
    ]
  }
}
```

> [!IMPORTANT]
> The overall summary covers **₹6,12,000** income across 13 transactions and **₹2,19,500** expenses across 25 transactions. Net positive balance of **₹3,92,500**.

---

## 👤 Test 2: Per-User Summaries

**Purpose:** Analyze each user's financial health individually.

```bash
# Replace <USER_ID> with the target user's ID
curl http://localhost:3000/api/dashboard/summary?userId=<USER_ID> \
  -H "Authorization: Bearer $TOKEN"
```

### Results per user:

| User | Income (₹) | Expenses (₹) | Net Balance (₹) | Records | Savings Rate |
|---|---|---|---|---|---|
| **Priya Sharma** | 85,000 | 25,000 | 60,000 | 6 | 70.6% |
| **Vikram Patel** | 1,35,000 | 63,500 | 71,500 | 7 | 53.0% |
| **Neha Gupta** | 1,02,000 | 36,000 | 66,000 | 7 | 64.7% |
| **Arjun Singh** | 85,000 | 40,000 | 45,000 | 7 | 52.9% |
| **Meera Joshi** | 1,25,000 | 55,000 | 70,000 | 8 | 56.0% |

> [!TIP]
> **Priya Sharma** has the best savings rate (70.6%), while **Arjun Singh** has the lowest net balance at ₹45,000.

---

## 📂 Test 3: Category Breakdown (EXPENSE — All Users)

**Purpose:** See where money is being spent across all users.

```bash
curl "http://localhost:3000/api/dashboard/categories?type=EXPENSE" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": [
    { "category": "Rent",          "total": 88000,  "count": 5 },
    { "category": "Travel",        "total": 35000,  "count": 2 },
    { "category": "Shopping",      "total": 20000,  "count": 3 },
    { "category": "Groceries",     "total": 18000,  "count": 4 },
    { "category": "Healthcare",    "total": 16500,  "count": 2 },
    { "category": "Utilities",     "total": 14000,  "count": 2 },
    { "category": "Entertainment", "total": 8500,   "count": 3 },
    { "category": "Gadgets",       "total": 8000,   "count": 1 },
    { "category": "Food",          "total": 6500,   "count": 2 },
    { "category": "Education",     "total": 5000,   "count": 1 }
  ]
}
```

> [!IMPORTANT]
> **Rent** dominates at ₹88,000 (40% of all expenses), followed by **Travel** at ₹35,000 and **Shopping** at ₹20,000.

---

## 🎯 Test 4: Arjun's Expense Categories

**Purpose:** Drill down into one user's spending patterns.

```bash
curl "http://localhost:3000/api/dashboard/categories?type=EXPENSE&userId=cmnklv13h000450vno8k121ic" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": [
    { "category": "Travel",    "total": 15000, "count": 1 },
    { "category": "Rent",      "total": 10000, "count": 1 },
    { "category": "Gadgets",   "total": 8000,  "count": 1 },
    { "category": "Groceries", "total": 4000,  "count": 1 },
    { "category": "Food",      "total": 3000,  "count": 1 }
  ]
}
```

> [!NOTE]
> Arjun's biggest expense is **Travel** (₹15,000), followed by **Rent** (₹10,000). He's the only user spending on **Gadgets**.

---

## 🏆 Test 5: Top 5 Expense Categories

**Purpose:** Identify the highest expense categories globally.

```bash
curl "http://localhost:3000/api/dashboard/top-categories?type=EXPENSE&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": [
    { "category": "Rent",       "total": 88000, "count": 5 },
    { "category": "Travel",     "total": 35000, "count": 2 },
    { "category": "Shopping",   "total": 20000, "count": 3 },
    { "category": "Groceries",  "total": 18000, "count": 4 },
    { "category": "Healthcare", "total": 16500, "count": 2 }
  ]
}
```

---

## 📈 Test 6: Meera's Monthly Trends

**Purpose:** View Meera's income vs expenses over time.

```bash
curl "http://localhost:3000/api/dashboard/trends/monthly?userId=cmnklv1ij000550vnlr27ux56" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": [
    {
      "month": "2026-03",
      "income": 125000,
      "expenses": 51000,
      "net": 74000
    },
    {
      "month": "2026-04",
      "income": 0,
      "expenses": 4000,
      "net": -4000
    }
  ]
}
```

> [!WARNING]
> Meera's April is in the **negative** (-₹4,000) as no income has been recorded yet for the month but she has Entertainment expenses.

---

## 📋 Test 7: Neha's Records (Date Sorted — Ascending)

**Purpose:** View all of Neha's records sorted chronologically.

```bash
curl "http://localhost:3000/api/records?userId=cmnklv0o7000350vnwgb96b9k&sortBy=date&order=asc" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": [
    { "amount": 90000, "type": "INCOME",  "category": "Salary",        "date": "2026-03-01" },
    { "amount": 18000, "type": "EXPENSE", "category": "Rent",           "date": "2026-03-02" },
    { "amount": 12000, "type": "INCOME",  "category": "Freelance",      "date": "2026-03-08" },
    { "amount": 7000,  "type": "EXPENSE", "category": "Shopping",       "date": "2026-03-12" },
    { "amount": 3500,  "type": "EXPENSE", "category": "Food",           "date": "2026-03-16" },
    { "amount": 5000,  "type": "EXPENSE", "category": "Education",      "date": "2026-03-22" },
    { "amount": 2500,  "type": "EXPENSE", "category": "Entertainment",  "date": "2026-04-03" }
  ],
  "pagination": { "total": 7, "page": 1, "limit": 20, "totalPages": 1 }
}
```

> [!TIP]
> Records are correctly sorted by date ascending. The analyst can also use `order=desc` for newest-first, and `sortBy=amount` to sort by amount.

---

## 📅 Test 8: Range Summary (March 2026 — All Users)

**Purpose:** Get financial summary for a specific date range.

```bash
curl "http://localhost:3000/api/dashboard/range-summary?startDate=2026-03-01&endDate=2026-03-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": {
    "period": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-31"
    },
    "totalIncome": 532000,
    "totalExpenses": 191500,
    "netBalance": 340500,
    "incomeCount": 10,
    "expenseCount": 20
  }
}
```

---

## 📅 Test 9: Vikram's Range Summary (March 2026)

**Purpose:** Date-range summary scoped to a specific user.

```bash
curl "http://localhost:3000/api/dashboard/range-summary?startDate=2026-03-01&endDate=2026-03-31&userId=cmnklv093000250vnq5oy32mc" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** ✅ `200 OK`
```json
{
  "data": {
    "period": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-31"
    },
    "totalIncome": 135000,
    "totalExpenses": 59000,
    "netBalance": 76000,
    "incomeCount": 2,
    "expenseCount": 4
  }
}
```

> [!NOTE]
> Vikram earned ₹1,35,000 and spent ₹59,000 in March, with a healthy net of ₹76,000. The April healthcare expense (₹4,500) is excluded from this range.

---

## 🔒 Analyst Permissions Matrix

| Operation | Endpoint | Method | Access |
|---|---|---|---|
| View records | `/api/records` | GET | ✅ All users (via `?userId=`) |
| View single record | `/api/records/:id` | GET | ✅ Any record |
| Create records | `/api/records` | POST | ✅ Own records only |
| Update records | `/api/records/:id` | PATCH | ✅ Own records only |
| Delete records | `/api/records/:id` | DELETE | ✅ Own records only |
| Dashboard summary | `/api/dashboard/summary` | GET | ✅ Scoped or global |
| Category breakdown | `/api/dashboard/categories` | GET | ✅ Scoped or global |
| Monthly trends | `/api/dashboard/trends/monthly` | GET | ✅ Scoped or global |
| Weekly trends | `/api/dashboard/trends/weekly` | GET | ✅ Scoped or global |
| Top categories | `/api/dashboard/top-categories` | GET | ✅ Scoped or global |
| Range summary | `/api/dashboard/range-summary` | GET | ✅ Scoped or global |
| View deleted records | `/api/records/deleted` | GET | ❌ Admin only |
| Restore records | `/api/records/:id/restore` | PATCH | ❌ Admin only |
| Hard delete | `/api/records/:id/hard` | DELETE | ❌ Admin only |
| Manage users | `/api/users` | * | ❌ Admin only |

> [!IMPORTANT]
> The ANALYST has **read access to all financial data** (including other users' records and dashboard analytics) but can only **create/update/delete their own records**. All admin-only operations (user management, soft-delete recovery, hard-delete) are restricted.

---

## 📊 Key Insights from the Data

### Income Distribution
| User | Salary (₹) | Side Income (₹) | Total (₹) |
|---|---|---|---|
| Vikram Patel | 1,20,000 | 15,000 (Investments) | 1,35,000 |
| Meera Joshi | 95,000 | 30,000 (Consulting) | 1,25,000 |
| Neha Gupta | 90,000 | 12,000 (Freelance) | 1,02,000 |
| Priya Sharma | 75,000 | 10,000 (Freelance) | 85,000 |
| Arjun Singh | 60,000 | 25,000 (Freelance) | 85,000 |

### Expense Efficiency
| User | Expenses (₹) | As % of Income | Rating |
|---|---|---|---|
| Priya Sharma | 25,000 | 29.4% | 🟢 Excellent |
| Neha Gupta | 36,000 | 35.3% | 🟢 Good |
| Arjun Singh | 40,000 | 47.1% | 🟡 Moderate |
| Vikram Patel | 63,500 | 47.0% | 🟡 Moderate |
| Meera Joshi | 55,000 | 44.0% | 🟡 Moderate |

---

## 🧪 Test Environment

| Property | Value |
|---|---|
| Server | `localhost:3000` |
| Database | Prisma + PostgreSQL |
| Auth | JWT Bearer tokens |
| Analyst email | `analyst@finance.dev` |
| Analyst ID | `cmnkm23fi000z8svnu1ph4kmo` |
| Total test users | 5 |
| Total seeded records | 34 |
| Date tested | 2026-04-04 |

---

## 📎 Available curl Commands — Quick Reference

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"analyst@finance.dev","password":"password123"}'

# Overall summary
curl http://localhost:3000/api/dashboard/summary -H "Authorization: Bearer $TOKEN"

# User-scoped summary
curl "http://localhost:3000/api/dashboard/summary?userId=<USER_ID>" -H "Authorization: Bearer $TOKEN"

# Category breakdown
curl "http://localhost:3000/api/dashboard/categories?type=EXPENSE" -H "Authorization: Bearer $TOKEN"

# User-scoped categories
curl "http://localhost:3000/api/dashboard/categories?type=EXPENSE&userId=<USER_ID>" -H "Authorization: Bearer $TOKEN"

# Top categories
curl "http://localhost:3000/api/dashboard/top-categories?type=EXPENSE&limit=5" -H "Authorization: Bearer $TOKEN"

# Monthly trends
curl "http://localhost:3000/api/dashboard/trends/monthly?userId=<USER_ID>" -H "Authorization: Bearer $TOKEN"

# Weekly trends
curl "http://localhost:3000/api/dashboard/trends/weekly?weeks=8" -H "Authorization: Bearer $TOKEN"

# Records by user (date sorted)
curl "http://localhost:3000/api/records?userId=<USER_ID>&sortBy=date&order=asc" -H "Authorization: Bearer $TOKEN"

# Range summary
curl "http://localhost:3000/api/dashboard/range-summary?startDate=2026-03-01&endDate=2026-03-31" -H "Authorization: Bearer $TOKEN"

# User-scoped range summary
curl "http://localhost:3000/api/dashboard/range-summary?startDate=2026-03-01&endDate=2026-03-31&userId=<USER_ID>" -H "Authorization: Bearer $TOKEN"
```
