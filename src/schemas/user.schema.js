const { z } = require('zod');

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

const assignRoleSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be VIEWER, ANALYST, or ADMIN' }),
  }),
});

const userIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid user ID'),
});

module.exports = { updateUserSchema, assignRoleSchema, userIdParamSchema };
