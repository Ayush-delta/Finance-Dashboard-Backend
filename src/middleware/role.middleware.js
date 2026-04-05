const { ForbiddenError } = require('../utils/errors');

// Role hierarchy — higher index = more permissions
const ROLE_HIERARCHY = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
};

// requireRole(...roles) — user must have one of the listed roles
// Example: requireRole('ANALYST', 'ADMIN')
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError());
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const hasAccess = roles.some(
      (role) => ROLE_HIERARCHY[role] !== undefined && userRoleLevel >= ROLE_HIERARCHY[role]
    );

    if (!hasAccess) {
      return next(
        new ForbiddenError(
          `This action requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

// requireMinRole(role) — user must have at least this role level
// Example: requireMinRole('ANALYST') allows ANALYST and ADMIN
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError());
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const minRoleLevel = ROLE_HIERARCHY[minRole] ?? 999;

    if (userRoleLevel < minRoleLevel) {
      return next(
        new ForbiddenError(
          `This action requires at least ${minRole} role. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { requireRole, requireMinRole };
