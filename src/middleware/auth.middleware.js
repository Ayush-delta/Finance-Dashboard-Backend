const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Use: Authorization: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid token.');
    }

    // Fetch fresh user from DB to catch deactivated accounts
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError('User no longer exists.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Contact an admin.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
