const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireMinRole } = require('../middleware/role.middleware');

// All dashboard routes require at least ANALYST role
router.use(authenticate);
router.use(requireMinRole('ANALYST'));

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/categories?type=INCOME|EXPENSE
router.get('/categories', dashboardController.getCategoryBreakdown);

// GET /api/dashboard/trends/monthly?months=12
router.get('/trends/monthly', dashboardController.getMonthlyTrends);

// GET /api/dashboard/trends/weekly?weeks=8
router.get('/trends/weekly', dashboardController.getWeeklyTrends);

// GET /api/dashboard/top-categories?limit=5&type=EXPENSE
router.get('/top-categories', dashboardController.getTopCategories);

// GET /api/dashboard/range-summary?startDate=2024-01-01&endDate=2024-12-31
router.get('/range-summary', dashboardController.getRangeSummary);

module.exports = router;
