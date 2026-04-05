const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireMinRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateUserSchema, assignRoleSchema } = require('../schemas/user.schema');

// All user routes require authentication
router.use(authenticate);

// GET /api/users — admin only
router.get('/', requireMinRole('ADMIN'), userController.getAllUsers);

// GET /api/users/:id — admin, or the user themselves (enforced in service)
router.get('/:id', userController.getUserById);

// PATCH /api/users/:id — admin, or the user themselves (enforced in service)
router.patch('/:id', validate(updateUserSchema), userController.updateUser);

// PATCH /api/users/:id/role — admin only
router.patch(
  '/:id/role',
  requireMinRole('ADMIN'),
  validate(assignRoleSchema),
  userController.assignRole
);

// PATCH /api/users/:id/toggle-status — admin only
router.patch('/:id/toggle-status', requireMinRole('ADMIN'), userController.toggleUserStatus);

// DELETE /api/users/:id — admin only
router.delete('/:id', requireMinRole('ADMIN'), userController.deleteUser);

module.exports = router;
