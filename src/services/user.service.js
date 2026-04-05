const prisma = require('../prisma/client');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const getAllUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  const where = {};
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
  if (!user) throw new NotFoundError('User');
  return user;
};

const updateUser = async (id, data, requestingUser) => {
  // Only admins can update other users; users can update themselves (name only)
  if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
    throw new ForbiddenError('You can only update your own profile.');
  }

  // Non-admins cannot change email or isActive
  if (requestingUser.role !== 'ADMIN') {
    delete data.email;
    delete data.isActive;
  }

  if (data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (conflict) throw new ConflictError('That email is already in use.');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
  return updated;
};

const assignRole = async (targetId, role, requestingUser) => {
  // Prevent admins from demoting themselves (safety guard)
  if (targetId === requestingUser.id && role !== 'ADMIN') {
    throw new ForbiddenError('You cannot change your own role.');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role },
    select: USER_SELECT,
  });
  return updated;
};

const toggleUserStatus = async (targetId, requestingUser) => {
  if (targetId === requestingUser.id) {
    throw new ForbiddenError('You cannot deactivate your own account.');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: !user.isActive },
    select: USER_SELECT,
  });
  return updated;
};

const deleteUser = async (targetId, requestingUser) => {
  if (targetId === requestingUser.id) {
    throw new ForbiddenError('You cannot delete your own account.');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw new NotFoundError('User');

  await prisma.user.delete({ where: { id: targetId } });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  assignRole,
  toggleUserStatus,
  deleteUser,
};
