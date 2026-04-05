const prisma = require('../prisma/client');

const BASE_WHERE = { isDeleted: false };

// Helper to build base where clause with optional userId scoping
const scopedWhere = (userId) => {
  const where = { ...BASE_WHERE };
  if (userId) where.createdById = userId;
  return where;
};

// ─── Core summary ───────────────────────────────────────────────────────────

const getSummary = async (userId) => {
  const base = scopedWhere(userId);

  const [incomeAgg, expenseAgg, recentRecords, totalRecords] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...base, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.aggregate({
      where: { ...base, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.findMany({
      where: base,
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        description: true,
        createdBy: { select: { name: true } },
      },
    }),
    prisma.financialRecord.count({ where: base }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpenses = expenseAgg._sum.amount || 0;

  return {
    totalIncome: round(totalIncome),
    totalExpenses: round(totalExpenses),
    netBalance: round(totalIncome - totalExpenses),
    totalRecords,
    incomeCount: incomeAgg._count,
    expenseCount: expenseAgg._count,
    recentActivity: recentRecords,
  };
};

// ─── Category breakdown ──────────────────────────────────────────────────────

const getCategoryBreakdown = async (type, userId) => {
  const where = scopedWhere(userId);
  if (type) where.type = type;

  const groups = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  });

  return groups.map((g) => ({
    category: g.category,
    type: g.type,
    total: round(g._sum.amount || 0),
    count: g._count,
  }));
};

// ─── Monthly trends ──────────────────────────────────────────────────────────

const getMonthlyTrends = async (months = 12, userId) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const base = scopedWhere(userId);

  const records = await prisma.financialRecord.findMany({
    where: { ...base, date: { gte: since } },
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  });

  const buckets = {};

  for (const record of records) {
    const key = formatYearMonth(record.date);
    if (!buckets[key]) {
      buckets[key] = { month: key, income: 0, expenses: 0, net: 0 };
    }
    if (record.type === 'INCOME') {
      buckets[key].income += record.amount;
    } else {
      buckets[key].expenses += record.amount;
    }
  }

  const trends = Object.values(buckets).map((b) => ({
    month: b.month,
    income: round(b.income),
    expenses: round(b.expenses),
    net: round(b.income - b.expenses),
  }));

  return trends;
};

// ─── Weekly trends ───────────────────────────────────────────────────────────

const getWeeklyTrends = async (weeks = 8, userId) => {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  since.setHours(0, 0, 0, 0);

  const base = scopedWhere(userId);

  const records = await prisma.financialRecord.findMany({
    where: { ...base, date: { gte: since } },
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  });

  const buckets = {};

  for (const record of records) {
    const key = getWeekKey(record.date);
    if (!buckets[key]) {
      buckets[key] = { week: key, income: 0, expenses: 0, net: 0 };
    }
    if (record.type === 'INCOME') {
      buckets[key].income += record.amount;
    } else {
      buckets[key].expenses += record.amount;
    }
  }

  const trends = Object.values(buckets).map((b) => ({
    week: b.week,
    income: round(b.income),
    expenses: round(b.expenses),
    net: round(b.income - b.expenses),
  }));

  return trends;
};

// ─── Top categories ──────────────────────────────────────────────────────────

const getTopCategories = async (limit = 5, type, userId) => {
  const where = scopedWhere(userId);
  if (type) where.type = type;

  const groups = await prisma.financialRecord.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });

  return groups.map((g) => ({
    category: g.category,
    total: round(g._sum.amount || 0),
    count: g._count,
  }));
};

// ─── Date-range summary ──────────────────────────────────────────────────────

const getRangeSummary = async (startDate, endDate, userId) => {
  const where = scopedWhere(userId);
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [income, expense] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalIncome = income._sum.amount || 0;
  const totalExpenses = expense._sum.amount || 0;

  return {
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    totalIncome: round(totalIncome),
    totalExpenses: round(totalExpenses),
    netBalance: round(totalIncome - totalExpenses),
    incomeCount: income._count,
    expenseCount: expense._count,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const round = (n) => Math.round(n * 100) / 100;

const formatYearMonth = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getWeekKey = (date) => {
  const d = new Date(date);
  // ISO week: Monday-based
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split('T')[0];
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getTopCategories,
  getRangeSummary,
};
