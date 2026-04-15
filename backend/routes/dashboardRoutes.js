import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import {
getDashboardSummary,
getDashboardStatsByPeriod,
getRecentTransactions,
getDashboardOverview,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/stats", protect, getDashboardStatsByPeriod);
router.get("/recent-transactions", protect, getRecentTransactions);
router.get("/overview", protect, getDashboardOverview);

export default router;