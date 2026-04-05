const dashboardService = require('../services/dashboard.service');
const response = require('../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const data = await dashboardService.getSummary(userId);
    return response.success(res, data, 'Dashboard summary.');
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type, userId } = req.query;
    const data = await dashboardService.getCategoryBreakdown(type, userId);
    return response.success(res, data, 'Category breakdown.');
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const months = Math.min(60, Math.max(1, parseInt(req.query.months) || 12));
    const { userId } = req.query;
    const data = await dashboardService.getMonthlyTrends(months, userId);
    return response.success(res, data, `Monthly trends for last ${months} months.`);
  } catch (err) {
    next(err);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeks = Math.min(52, Math.max(1, parseInt(req.query.weeks) || 8));
    const { userId } = req.query;
    const data = await dashboardService.getWeeklyTrends(weeks, userId);
    return response.success(res, data, `Weekly trends for last ${weeks} weeks.`);
  } catch (err) {
    next(err);
  }
};

const getTopCategories = async (req, res, next) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));
    const { type, userId } = req.query;
    const data = await dashboardService.getTopCategories(limit, type, userId);
    return response.success(res, data, 'Top categories.');
  } catch (err) {
    next(err);
  }
};

const getRangeSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const data = await dashboardService.getRangeSummary(startDate, endDate, userId);
    return response.success(res, data, 'Range summary.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getTopCategories,
  getRangeSummary,
};
