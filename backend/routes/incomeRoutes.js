import express from 'express';
import Protect from '../middlewares/authMiddleware.js';
import {
createIncome,
getAllIncome,
getIncomeById,
updateIncome,
deleteIncome,
getIncomeSummary,
} from '../controllers/incomeController.js';

const router = express.Router();

router.get("/summary", Protect, getIncomeSummary);
router.get("/", Protect, getAllIncome);
router.post("/", Protect, createIncome);
router.get("/:id", Protect, getIncomeById);
router.put("/:id", Protect, updateIncome);
router.delete("/:id", Protect, deleteIncome);

export default router;