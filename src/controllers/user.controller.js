const userService = require('../services/user.service');
const response = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getAllUsers(req.query);
    return response.paginated(res, users, pagination);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return response.success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    return response.success(res, user, 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

const assignRole = async (req, res, next) => {
  try {
    const user = await userService.assignRole(req.params.id, req.body.role, req.user);
    return response.success(res, user, `Role updated to ${req.body.role}.`);
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id, req.user);
    const status = user.isActive ? 'activated' : 'deactivated';
    return response.success(res, user, `User ${status} successfully.`);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    return response.success(res, null, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  assignRole,
  toggleUserStatus,
  deleteUser,
};
