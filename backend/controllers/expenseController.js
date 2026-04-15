import mongoose from 'mongoose';
import Expense from '../models/Expenses.js';

// Create a new expense

const createExpense = async (req, res) => {
    try {
        const { title, amount, category, expenseDate, note } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({
                message: 'Title, amount, and category are required'
            });
        }

        const expense = await Expense.create({
            title: title.trim(),
            amount,
            category: category.trim().toLowerCase(),
            expenseDate: expenseDate || Date.now(),
            note: note ? note.trim() : '',
            createdBy: req.admin._id,
        });
        const populatedExpense = await Expense.findById(expense._id)
            .populate("createdBy", "name email");

        res.status(201).json({
            message: 'Expense created successfully',
            expense: populatedExpense,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Get all expenses

const getAllExpenses = async (req, res) => {
    try {
        const {
            search = "",
            category = "",
            period = "",
            startDate = "",
            endDate = "",
        } = req.query;

        const query = {};

        if (category.trim()) {
            query.category = category.trim().toLowerCase();
        }

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) {
                query.expenseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.expenseDate.$lte = new Date(endDate);
            }

        } else if (period) {
            const now = new Date();
            let start = null;

            if (period === "daily") {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (period === "weekly") {
                start = new Date(now);
                start.setDate(now.getDate() - 7);
            } else if (period === "monthly") {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (period === "yearly") {
                start = new Date(now.getFullYear(), 0, 1);
            }
            if (start) {
                query.expenseDate = { $gte: start, $lte: now };
            }
        }
        let expenses = await Expense.find(query)
            .populate("createdBy", "name email")
            .sort({ expenseDate: -1, createdAt: -1 });

        if (search.trim()) {
            const searchValue = search.trim().toLowerCase();

            expenses = expenses.filter((item) => {
                const title = item.title?.toLowerCase() || "";
                const note = item.note?.toLowerCase() || "";
                const categoryValue = item.category?.toLowerCase() || "";

                return (
                    title.includes(searchValue) ||
                    note.includes(searchValue) ||
                    categoryValue.includes(searchValue)
                );
            });
        }

        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

        res.status(200).json({
            message: 'Expense entries fetched successfully',
            count: expenses.length,
            expenses,
            totalExpense,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve expenses',
            error: error.message
        });
    }
};

// Get a single expense by ID

const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(id)
            .populate("createdBy", "name email");

        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found',
            });
        }

        return res.status(200).json({
            message: "Expense entry fetched successfully",
            expense,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve expense',
            error: error.message
        });
    }
};


// Update expense entry

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, category, note, expenseDate } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid expense ID'
            });
        }
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found',
            });
        }

        if (title !== undefined) expense.title = title.trim();
        if (amount !== undefined) expense.amount = amount;
        if (category !== undefined) expense.category = category.trim().toLowerCase();
        if (note !== undefined) expense.note = note.trim();
        if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);

        const updatedExpense = await expense.save();
        const populatedExpense = await Expense.findById(updatedExpense._id)
            .populate("createdBy", "name email");

        return res.status(200).json({
            message: 'Expense updated successfully',
            expense: populatedExpense,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update expense',
            error: error.message
        });
    }
};


// Delete expense entry

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found',
            });
        }
        await expense.deleteOne();
        return res.status(200).json({
            message: 'Expense deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// Get expense summary

const getExpenseSummary = async (req, res) => {
    try {
        const {
            period = "",
            startDate = "",
            endDate = "",
        } = req.query;

        const query = {};
        const now = new Date(); //yesle chai now vanne variable ma current date and time store garcha

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        } else if (period) {
            let start = null;
            if (period === "daily") {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (period === "weekly") {
                start = new Date(now);
                start.setDate(now.getDate() - 7);
            } else if (period === "monthly") {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (period === "yearly") {
                start = new Date(now.getFullYear(), 0, 1);
            }
            if (start) {
                query.expenseDate = { $gte: start, $lte: now };
            }
        }
        const expenses = await Expense.find(query);

        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalEntries = expenses.length;
        const categoryBreakdown = expenses.reduce((acc, item) => {
            const category = item.category || "miscellaneous";
            acc[category] = (acc[category] || 0) + item.amount;
            return acc;
        }, {});
        return res.status(200).json({
            message: 'Expense summary fetched successfully',
            totalExpense,
            totalEntries,
            categoryBreakdown
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch expense summary',
            error: error.message
        });
    }
};



export { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getExpenseSummary };
