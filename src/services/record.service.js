const prisma = require('../prisma/client');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const RECORD_SELECT = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  description: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
};

const buildWhereClause = (query) => {
  const where = { isDeleted: false };

  if (query.type) where.type = query.type;
  if (query.category) where.category = { contains: query.category };
  if (query.userId) where.createdById = query.userId;

  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = new Date(query.startDate);
    if (query.endDate) where.date.lte = new Date(query.endDate);
  }

  return where;
};

const getAllRecords = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const where = buildWhereClause(query);

  const sortBy = ['date', 'amount', 'createdAt'].includes(query.sortBy)
    ? query.sortBy
    : 'date';
  const order = query.order === 'asc' ? 'asc' : 'desc';

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      select: RECORD_SELECT,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const getRecordById = async (id) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    select: RECORD_SELECT,
  });
  if (!record) throw new NotFoundError('Financial record');
  return record;
};

const createRecord = async (data, requestingUser) => {
  const { userId, ...recordData } = data;

  // Determine whose record this is
  let targetUserId = requestingUser.id;

  if (userId && userId !== requestingUser.id) {
    // Only admins can create records on behalf of other users
    if (requestingUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create records for other users.');
    }

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new NotFoundError('Target user');

    targetUserId = userId;
  }

  const record = await prisma.financialRecord.create({
    data: {
      ...recordData,
      createdById: targetUserId,
    },
    select: RECORD_SELECT,
  });
  return record;
};

const updateRecord = async (id, data, requestingUser) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });
  if (!record) throw new NotFoundError('Financial record');

  // Analysts can only edit their own records; admins can edit any
  if (
    requestingUser.role === 'ANALYST' &&
    record.createdById !== requestingUser.id
  ) {
    throw new ForbiddenError('Analysts can only edit their own records.');
  }

  const updated = await prisma.financialRecord.update({
    where: { id },
    data,
    select: RECORD_SELECT,
  });
  return updated;
};

const softDeleteRecord = async (id, requestingUser) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });
  if (!record) throw new NotFoundError('Financial record');

  // Analysts can only delete their own records; admins can delete any
  if (
    requestingUser.role === 'ANALYST' &&
    record.createdById !== requestingUser.id
  ) {
    throw new ForbiddenError('Analysts can only delete their own records.');
  }

  await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

// Admin-only: permanently delete
const hardDeleteRecord = async (id) => {
  const record = await prisma.financialRecord.findUnique({ where: { id } });
  if (!record) throw new NotFoundError('Financial record');
  await prisma.financialRecord.delete({ where: { id } });
};

// Admin-only: list soft-deleted records
const getDeletedRecords = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where: { isDeleted: true },
      select: RECORD_SELECT,
      skip,
      take: limit,
      orderBy: { deletedAt: 'desc' },
    }),
    prisma.financialRecord.count({ where: { isDeleted: true } }),
  ]);
  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

// Admin-only: restore soft-deleted record
const restoreRecord = async (id) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: true },
  });
  if (!record) throw new NotFoundError('Deleted financial record');

  const restored = await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
    select: RECORD_SELECT,
  });
  return restored;
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  softDeleteRecord,
  hardDeleteRecord,
  getDeletedRecords,
  restoreRecord,
};
