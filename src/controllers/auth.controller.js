const authService = require('../services/auth.service');
const response = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return response.created(res, result, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return response.success(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return response.success(res, user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
