# Assumptions & Design Decisions

## Role model
- Three roles: VIEWER, ANALYST, ADMIN with a numeric hierarchy (0/1/2)
- VIEWER is the default role on registration
- Analysts can only edit/delete their own records, not others'

## Soft delete
- Financial records are soft-deleted by default (isDeleted + deletedAt)
- Hard delete is available to admins only
- Deleted records are excluded from all normal queries and analytics

## Authentication
- JWT tokens are stateless, role is encoded in the payload
- Auth middleware re-fetches user from DB on every request to catch 
  deactivated accounts immediately without waiting for token expiry
- Login uses timing-safe bcrypt comparison even for non-existent users
  to prevent email enumeration attacks

## Database
- SQLite was replaced with PostgreSQL (Neon) for production readiness
- Prisma v7 adapter pattern used for Node.js + PostgreSQL connection
- All aggregations use real SQL (groupBy, aggregate) not in-memory logic

## Pagination
- Default page size: 20, maximum: 100
- All list endpoints return pagination metadata

## Validation
- Zod schemas are the single source of truth for all input validation
- Date strings are coerced to Date objects in the validation layer.
