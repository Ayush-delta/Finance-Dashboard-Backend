const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .max(999_999_999, 'Amount too large'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z.string().min(1, 'Category is required').max(100),
  date: z.coerce.date({ invalid_type_error: 'Invalid date' }),
  description: z.string().max(500).optional(),
  userId: z.string().min(1, 'Invalid user ID').optional(),
});

const updateRecordSchema = createRecordSchema.partial();

const recordFilterSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

const recordIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid record ID'),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
  recordIdParamSchema,
};
