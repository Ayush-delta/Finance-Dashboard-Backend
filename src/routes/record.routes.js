const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireMinRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} = require('../schemas/record.schema');

// All record routes require authentication
router.use(authenticate);

// GET /api/records — viewer, analyst, admin
router.get(
  '/',
  validate(recordFilterSchema, 'query'),
  recordController.getAllRecords
);

// GET /api/records/deleted — admin only
router.get('/deleted', requireMinRole('ADMIN'), recordController.getDeletedRecords);

// GET /api/records/:id — viewer, analyst, admin
router.get('/:id', recordController.getRecordById);

// POST /api/records — analyst, admin
router.post(
  '/',
  requireMinRole('ANALYST'),
  validate(createRecordSchema),
  recordController.createRecord
);

// PATCH /api/records/:id — analyst (own), admin (any)
router.patch(
  '/:id',
  requireMinRole('ANALYST'),
  validate(updateRecordSchema),
  recordController.updateRecord
);

// DELETE /api/records/:id — soft delete — analyst (own), admin (any)
router.delete('/:id', requireMinRole('ANALYST'), recordController.deleteRecord);

// DELETE /api/records/:id/hard — permanent delete — admin only
router.delete('/:id/hard', requireMinRole('ADMIN'), recordController.hardDeleteRecord);

// PATCH /api/records/:id/restore — admin only
router.patch('/:id/restore', requireMinRole('ADMIN'), recordController.restoreRecord);

module.exports = router;
