import Student from "../models/Student.js";
import Income from "../models/Income.js";
import Expense from "../models/Expenses.js";

// Yo vaneko chai Helper function ho, jasle chai hamilai  date ko range dincha

const getDateRange = (period) => {
    const now = new Date();
    let startDate = null;

    if (period === "daily") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "yearly") {
        startDate = new Date(now.getFullYear(), 0, 1);
    }
    return startDate ? { $gte: startDate, $lte: now } : null;
};

const getRecentMonthBuckets = (monthsBack = 5) => {
    const now = new Date();
    const buckets = [];

    for (let index = monthsBack; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        buckets.push({
            key,
            label: date.toLocaleString("en", { month: "short" }),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            income: 0,
            expenses: 0,
            profit: 0,
        });
    }

    return buckets;
};

const getMonthlyTotals = async (Model, dateField, startDate) => (
    Model.aggregate([
        {
            $match: {
                [dateField]: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: `$${dateField}` },
                    month: { $month: `$${dateField}` },
                },
                total: { $sum: "$amount" },
            },
        },
    ])
);

const buildMonthlyTrend = async () => {
    const buckets = getRecentMonthBuckets();
    const trendStart = new Date(buckets[0].year, buckets[0].month - 1, 1);
    const [incomeTotals, expenseTotals] = await Promise.all([
        getMonthlyTotals(Income, "incomeDate", trendStart),
        getMonthlyTotals(Expense, "expenseDate", trendStart),
    ]);

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    incomeTotals.forEach((item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
        const bucket = bucketMap.get(key);
        if (bucket) bucket.income = item.total;
    });

    expenseTotals.forEach((item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
        const bucket = bucketMap.get(key);
        if (bucket) bucket.expenses = item.total;
    });

    return buckets.map((bucket) => ({
        period: bucket.label,
        income: bucket.income,
        expenses: bucket.expenses,
        profit: bucket.income - bucket.expenses,
    }));
};


// Get full dashboard data

const getDashboardSummary = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ isActive: true });
        const inactiveStudents = await Student.countDocuments({ isActive: false });

        const allIncome = await Income.find();
        const allExpenses = await Expense.find();

        const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = allExpenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        return res.status(200).json({
            message: "Dashboard summary fetched successfully",
            summary: {
                students: {
                    total: totalStudents,
                    active: activeStudents,
                    inactive: inactiveStudents,
                },
                finance: {
                    totalIncome,
                    totalExpenses,
                    netProfit,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard summary",
            error: error.message,
        });
    }
};

// Get dashboard data by period (daily, weekly, monthly, yearly)

const getDashboardStatsByPeriod = async (req, res) => {
    try {
        const { period = "daily" } = req.query;

        if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
            return res.status(400).json({
                message: "Invalid period. Must be one of: daily, weekly, monthly, yearly",
            });
        }
        const dateFilter = getDateRange(period);

        const incomes = await Income.find({ incomeDate: dateFilter });
        const expenses = await Expense.find({ expenseDate: dateFilter });

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        return res.status(200).json({
            message: "Dashboard stats fetched successfully",
            period,
            stats: {
                totalIncome,
                totalExpenses,
                netProfit,
                totalIncomeEntries: incomes.length,
                totalExpenseEntries: expenses.length,
            },
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard stats by period",
            error: error.message,
        });
    }
};


// Get recent transactions (last 5 incomes and expenses)

const getRecentTransactions = async (req, res) => {
    try {
        const recentIncome = await Income.find()
            .populate("student", "fullName className section rollNumber")
            .sort({ incomeDate: -1, createdAt: -1 })
            .limit(5);

        const recentExpenses = await Expense.find()
            .sort({ expenseDate: -1, createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            message: "Recent transactions fetched successfully",
            recentIncome,
            recentExpenses,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching recent transactions",
            error: error.message,
        });
    }
};

// Get complete dashboard data

const getDashboardOverview = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({
            isActive: true,
        });
        const inactiveStudents = await Student.countDocuments({ isActive: false });

        const allIncome = await Income.find();
        const allExpenses = await Expense.find();

        const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = allExpenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        const dailyFilter = getDateRange("daily");
        const weeklyFilter = getDateRange("weekly");
        const monthlyFilter = getDateRange("monthly");
        const yearlyFilter = getDateRange("yearly");

        const dailyIncome = await Income.find({ incomeDate: dailyFilter });
        const dailyExpenses = await Expense.find({ expenseDate: dailyFilter });

        const weeklyIncome = await Income.find({ incomeDate: weeklyFilter });
        const weeklyExpenses = await Expense.find({ expenseDate: weeklyFilter });

        const monthlyIncome = await Income.find({ incomeDate: monthlyFilter });
        const monthlyExpenses = await Expense.find({ expenseDate: monthlyFilter });

        const yearlyIncome = await Income.find({ incomeDate: yearlyFilter });
        const yearlyExpenses = await Expense.find({ expenseDate: yearlyFilter });

        const recentIncome = await Income.find()
            .populate("student", "fullName className section rollNumber")
            .sort({ incomeDate: -1, createdAt: -1 })
            .limit(5);

        const recentExpenses = await Expense.find()
            .sort({ expenseDate: -1, createdAt: -1 })
            .limit(5);
        const trends = await buildMonthlyTrend();

        return res.status(200).json({
            message: "Dashboard overview fetched successfully",
            overview: {
                students: {
                    total: totalStudents,
                    active: activeStudents,
                    inactive: inactiveStudents,
                },
                finance: {
                    totalIncome,
                    totalExpenses,
                    netProfit,
                },
                daily: {
                    income: dailyIncome.reduce((sum, item) => sum + item.amount, 0),
                    expenses: dailyExpenses.reduce((sum, item) => sum + item.amount, 0),
                    profit:
                        dailyIncome.reduce((sum, item) => sum + item.amount, 0) -
                        dailyExpenses.reduce((sum, item) => sum + item.amount, 0),
                },
                weekly: {
                    income: weeklyIncome.reduce((sum, item) => sum + item.amount, 0),
                    expenses: weeklyExpenses.reduce((sum, item) => sum + item.amount, 0),
                    profit:
                        weeklyIncome.reduce((sum, item) => sum + item.amount, 0) -
                        weeklyExpenses.reduce((sum, item) => sum + item.amount, 0),
                },
                monthly: {
                    income: monthlyIncome.reduce((sum, item) => sum + item.amount, 0),
                    expenses: monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
                    profit:
                        monthlyIncome.reduce((sum, item) => sum + item.amount, 0) -
                        monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
                },
                yearly: {
                    income: yearlyIncome.reduce((sum, item) => sum + item.amount, 0),
                    expenses: yearlyExpenses.reduce((sum, item) => sum + item.amount, 0),
                    profit:
                        yearlyIncome.reduce((sum, item) => sum + item.amount, 0) -
                        yearlyExpenses.reduce((sum, item) => sum + item.amount, 0),
                },
                recentTransactions: {
                    income: recentIncome,
                    expenses: recentExpenses,
                },
                trends,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard overview",
            error: error.message,
        });
    }
};


export { getDashboardSummary, getDashboardStatsByPeriod, getRecentTransactions, getDashboardOverview };
