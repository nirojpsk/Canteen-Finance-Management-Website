import mongoose from "mongoose";
import Income from "../models/Income.js";
import Student from "../models/Student.js";

// Create a new Income

const createIncome = async (req, res) => {
    try {
        const { student, amount, paymentMethod, incomeDate, note, title } = req.body;
        if (!student || !amount) {
            return res.status(400).json({
                message: "Student and amount are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(student)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const existingStudent = await Student.findById(student);
        if (!existingStudent) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        if (!existingStudent.isActive) {
            return res.status(400).json({
                message: "Cannot create income for an inactive student"
            });
        }

        const income = await Income.create({
            student,
            amount,
            paymentMethod: paymentMethod?.trim().toLowerCase() || "cash",
            incomeDate: incomeDate || Date.now(),
            title: title?.trim() || "",
            createdBy: req.admin._id,
            note: note?.trim() || "",
        });

        const populatedIncome = await Income.findById(income._id)
            .populate("student", "fullName className section rollNumber")
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Income created successfully",
            income: populatedIncome
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating income",
            error: error.message
        });
    }
};


// Get all incomes

const getAllIncome = async (req, res) => {
    try {
        const {
            search = "",
            paymentMethod = "",
            period = "",
            studentId = "",
            startDate = "",
            endDate = "",
        } = req.query;

        const query = {};

        if (studentId) {
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                return res.status(400).json({
                    message: "Invalid student ID"
                });
            }
            query.student = studentId;
        }


        if (paymentMethod.trim()) {
            query.paymentMethod = paymentMethod.trim().toLowerCase();
        }

        if (startDate || endDate) {
            query.incomeDate = {};
            if (startDate) query.incomeDate.$gte = new Date(startDate);
            if (endDate) query.incomeDate.$lte = new Date(endDate);
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
                query.incomeDate = { $gte: start, $lte: now };
            }
        }
        let incomes = await Income.find(query)
            .populate("student", "fullName className section rollNumber phone")
            .populate("createdBy", "name email")
            .sort({ incomeDate: -1, createdAt: -1 });

        if (search.trim()) {
            const searchValue = search.trim().toLowerCase();

            incomes = incomes.filter((item) => {
                const studentName = item.student?.fullName?.toLowerCase() || "";
                const rollNumber = item.student?.rollNumber?.toLowerCase() || "";
                const title = item.title?.toLowerCase() || "";
                const note = item.note?.toLowerCase() || "";

                return (
                    studentName.includes(searchValue) ||
                    rollNumber.includes(searchValue) ||
                    title.includes(searchValue) ||
                    note.includes(searchValue)
                );
            });
        }

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

        return res.status(200).json({
            message: "Income entries fetched successfully",
            count: incomes.length,
            totalIncome,
            incomes,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching incomes",
            error: error.message
        });
    }
};

// Get single income by ID

const getIncomeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid income ID",
            });
        }

        const income = await Income.findById(id)
            .populate("student", "fullName className section rollNumber phone")
            .populate("createdBy", "name email");

        if (!income) {
            return res.status(404).json({
                message: "Income entry not found",
            });
        }

        return res.status(200).json({
            message: "Income entry fetched successfully",
            income,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching income",
            error: error.message
        });
    }
};


// Update income

const updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { student, amount, paymentMethod, incomeDate, title, note } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid income ID"
            });
        }
        const income = await Income.findById(id);

        if (!income) {
            return res.status(404).json({
                message: "Income entry not found"
            });
        }
        if (student !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(student)) {
                return res.status(400).json({
                    message: "Invalid student ID"
                });
            }
            const existingStudent = await Student.findById(student);
            if (!existingStudent) {
                return res.status(404).json({
                    message: "Student not found",
                });
            }

            if (!existingStudent.isActive) {
                return res.status(400).json({
                    message: "Cannot assign income to an inactive student"
                });
            }
            income.student = student;
        }

        if (amount !== undefined) income.amount = amount;
        if (paymentMethod !== undefined) {
            income.paymentMethod = paymentMethod.trim().toLowerCase();
        }
        if (incomeDate !== undefined) income.incomeDate = incomeDate;
        if (title !== undefined) income.title = title.trim();
        if (note !== undefined) income.note = note.trim();

        const updatedIncome = await income.save();

        const populatedIncome = await Income.findById(updatedIncome._id)
            .populate("student", "fullName className section rollNumber")
            .populate("createdBy", "name email");

        return res.status(200).json({
            message: "Income entry updated successfully",
            income: populatedIncome,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating income",
            error: error.message,
        });
    }
};

// Delete income

const deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid income ID",
            });
        }

        const income = await Income.findById(id);

        if (!income) {
            return res.status(404).json({
                message: "Income entry not found",
            });
        }
        await income.deleteOne();
        return res.status(200).json({
            message: "Income entry deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting income",
            error: error.message,
        });
    }
};

// Get income summary for dashboard

const getIncomeSummary = async (req, res) => {
    try {
        const { period = "", startDate = "", endDate = "" } = req.query;
        const query = {};

        const now = new Date();

        if (startDate || endDate) {
            query.incomeDate = {};
            if (startDate) query.incomeDate.$gte = new Date(startDate);
            if (endDate) query.incomeDate.$lte = new Date(endDate);
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
                query.incomeDate = { $gte: start, $lte: now };
            }
        }
        const incomes = await Income.find(query)
            .populate("student", "fullName className section rollNumber");

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalEntries = incomes.length;

        const paymentMethodBreakdown = incomes.reduce((acc, item) => {
            const method = item.paymentMethod || "other";
            acc[method] = (acc[method] || 0) + item.amount; // yesma acc[method] = acc[method] || 0; le method ko amount calculate garna lai ho, jaba method pahile dekhi exist gardaina, teti bela 0 set garne
            return acc;
        }, {});
        return res.status(200).json({
            message: "Income summary fetched successfully",
            totalIncome,
            totalEntries,
            paymentMethodBreakdown,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching income summary",
            error: error.message,
        });
    }
};



export { createIncome, getAllIncome, getIncomeById, updateIncome, deleteIncome, getIncomeSummary };
