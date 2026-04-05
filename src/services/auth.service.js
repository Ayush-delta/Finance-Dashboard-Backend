const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

const SALT_ROUNDS = 12;

const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const register = async ({ email, name, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError(`An account with email "${email}" already exists.`);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role || 'VIEWER',
    },
  });

  const token = signToken(user.id, user.role);
  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Use constant-time comparison even on missing user to prevent timing attacks
  const passwordMatch = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, '$2a$12$invalidhashfortimingnormalization');

  if (!user || !passwordMatch) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Contact an admin.');
  }

  const token = signToken(user.id, user.role);
  return { user: sanitizeUser(user), token };
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

module.exports = { register, login, getMe };
