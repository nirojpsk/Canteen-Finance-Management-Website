import express from 'express';
import protect from "../middlewares/authMiddleware.js";
import {
createExpense,
getAllExpenses,
getExpenseById,
updateExpense,
deleteExpense,
getExpenseSummary,
} from '../controllers/expenseController.js';

const router = express.Router();

router.get('/summary', protect, getExpenseSummary);
router.get('/', protect, getAllExpenses);
router.post('/', protect, createExpense);
router.get('/:id', protect, getExpenseById);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;