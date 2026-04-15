import Student from "../models/Student.js";
import Income from "../models/Income.js";
import Expense from "../models/Expenses.js";
import { applyPeriodDateFilter, getDateRangeForPeriod } from "../utils/dateFilterHelper.js";

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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getMonthKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

const getDayKey = (year, month, day) => `${getMonthKey(year, month)}-${String(day).padStart(2, "0")}`;

const getSafeDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getDateFilterOptions = (query = {}) => ({
    period: query.period || "",
    day: query.day || "",
    month: query.month || "",
    year: query.year || "",
    startDate: query.startDate || "",
    endDate: query.endDate || "",
});

const applyDashboardDateFilter = (query, fieldName, filters = {}) => {
    const startDate = getSafeDate(filters.startDate);
    const endDate = getSafeDate(filters.endDate);

    if (filters.startDate && !startDate) return { error: "Invalid start date." };
    if (filters.endDate && !endDate) return { error: "Invalid end date." };

    if (startDate || endDate) {
        query[fieldName] = {};
        if (startDate) query[fieldName].$gte = startDate;
        if (endDate) query[fieldName].$lte = endDate;
        return {};
    }

    if (filters.period) {
        return applyPeriodDateFilter(query, fieldName, filters);
    }

    return {};
};

const createMonthlyBuckets = (startDate, endDate, includeYear = false) => {
    const buckets = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= end) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1;

        buckets.push({
            key: getMonthKey(year, month),
            period: includeYear ? `${monthNames[month - 1]} ${year}` : monthNames[month - 1],
            income: 0,
            expenses: 0,
            profit: 0,
        });

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
};

const createDailyBuckets = (startDate, endDate) => {
    const buckets = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (cursor <= end) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1;
        const day = cursor.getDate();

        buckets.push({
            key: getDayKey(year, month, day),
            period: `${monthNames[month - 1]} ${day}`,
            income: 0,
            expenses: 0,
            profit: 0,
        });

        cursor.setDate(cursor.getDate() + 1);
    }

    return buckets;
};

const getBoundaryTransactionDate = async (sortDirection) => {
    const [income, expense] = await Promise.all([
        Income.findOne().sort({ incomeDate: sortDirection }).select("incomeDate"),
        Expense.findOne().sort({ expenseDate: sortDirection }).select("expenseDate"),
    ]);
    const dates = [income?.incomeDate, expense?.expenseDate].filter(Boolean).map((date) => new Date(date));

    if (!dates.length) return null;

    return sortDirection === 1
        ? new Date(Math.min(...dates.map((date) => date.getTime())))
        : new Date(Math.max(...dates.map((date) => date.getTime())));
};

const getTrendTotals = async (Model, dateField, startDate, endDate, bucketType) => (
    Model.aggregate([
        {
            $match: {
                [dateField]: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: bucketType === "day"
                    ? {
                        year: { $year: `$${dateField}` },
                        month: { $month: `$${dateField}` },
                        day: { $dayOfMonth: `$${dateField}` },
                    }
                    : {
                        year: { $year: `$${dateField}` },
                        month: { $month: `$${dateField}` },
                    },
                total: { $sum: "$amount" },
            },
        },
    ])
);

const getTrendRange = async (filters = {}) => {
    const normalizedPeriod = String(filters.period || "").trim().toLowerCase();
    const customStart = getSafeDate(filters.startDate);
    const customEnd = getSafeDate(filters.endDate);

    if (normalizedPeriod && !["daily", "weekly", "monthly", "yearly"].includes(normalizedPeriod)) {
        return { error: "Invalid period. Must be one of: daily, weekly, monthly, yearly" };
    }

    if (customStart || customEnd) {
        const now = new Date();
        return {
            start: customStart || new Date(now.getFullYear(), 0, 1),
            end: customEnd || now,
            bucketType: customStart && customEnd && (customEnd - customStart) <= 62 * 24 * 60 * 60 * 1000 ? "day" : "month",
            includeYear: true,
        };
    }

    if (normalizedPeriod) {
        const { start, end, error } = getDateRangeForPeriod(filters);
        if (error) return { error };

        return {
            start,
            end,
            bucketType: normalizedPeriod === "daily" || normalizedPeriod === "weekly" || normalizedPeriod === "monthly" ? "day" : "month",
            includeYear: false,
        };
    }

    const now = new Date();
    const oldest = await getBoundaryTransactionDate(1);
    const newest = await getBoundaryTransactionDate(-1);
    const start = oldest || new Date(now.getFullYear(), 0, 1);
    const latest = newest && newest > now ? newest : now;

    return {
        start,
        end: latest,
        bucketType: "month",
        includeYear: start.getFullYear() !== latest.getFullYear(),
    };
};

const buildTrend = async (filters = {}) => {
    const range = await getTrendRange(filters);
    if (range.error) return { error: range.error };

    const buckets = range.bucketType === "day"
        ? createDailyBuckets(range.start, range.end)
        : createMonthlyBuckets(range.start, range.end, range.includeYear);
    const [incomeTotals, expenseTotals] = await Promise.all([
        getTrendTotals(Income, "incomeDate", range.start, range.end, range.bucketType),
        getTrendTotals(Expense, "expenseDate", range.start, range.end, range.bucketType),
    ]);

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    incomeTotals.forEach((item) => {
        const key = range.bucketType === "day"
            ? getDayKey(item._id.year, item._id.month, item._id.day)
            : getMonthKey(item._id.year, item._id.month);
        const bucket = bucketMap.get(key);
        if (bucket) bucket.income = item.total;
    });

    expenseTotals.forEach((item) => {
        const key = range.bucketType === "day"
            ? getDayKey(item._id.year, item._id.month, item._id.day)
            : getMonthKey(item._id.year, item._id.month);
        const bucket = bucketMap.get(key);
        if (bucket) bucket.expenses = item.total;
    });

    return {
        trends: buckets.map((bucket) => ({
            period: bucket.period,
            income: bucket.income,
            expenses: bucket.expenses,
            profit: bucket.income - bucket.expenses,
        })),
    };
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
        const filters = getDateFilterOptions(req.query);
        const normalizedPeriod = String(filters.period || "").trim().toLowerCase();

        if (normalizedPeriod && !["daily", "weekly", "monthly", "yearly"].includes(normalizedPeriod)) {
            return res.status(400).json({
                message: "Invalid period. Must be one of: daily, weekly, monthly, yearly",
            });
        }

        const incomeQuery = {};
        const expenseQuery = {};
        const incomeFilter = applyDashboardDateFilter(incomeQuery, "incomeDate", filters);
        if (incomeFilter.error) return res.status(400).json({ message: incomeFilter.error });
        const expenseFilter = applyDashboardDateFilter(expenseQuery, "expenseDate", filters);
        if (expenseFilter.error) return res.status(400).json({ message: expenseFilter.error });

        const [incomes, expenses] = await Promise.all([
            Income.find(incomeQuery),
            Expense.find(expenseQuery),
        ]);

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        return res.status(200).json({
            message: "Dashboard stats fetched successfully",
            period: normalizedPeriod || "all",
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
        const filters = getDateFilterOptions(req.query);
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
        const trendResult = await buildTrend(filters);

        if (trendResult.error) {
            return res.status(400).json({ message: trendResult.error });
        }

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
                trends: trendResult.trends,
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
