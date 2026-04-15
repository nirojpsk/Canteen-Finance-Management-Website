const isValidInteger = (value) => /^\d+$/.test(String(value).trim());

const createDayRange = (year, month, day) => {
	const start = new Date(year, month - 1, day, 0, 0, 0, 0);

	if (
		start.getFullYear() !== year ||
		start.getMonth() !== month - 1 ||
		start.getDate() !== day
	) {
		return null;
	}

	const end = new Date(year, month - 1, day, 23, 59, 59, 999);
	return { start, end };
};

export const getDateRangeForPeriod = ({ period = "", day = "", month = "", year = "" } = {}) => {
	const normalizedPeriod = String(period).trim().toLowerCase();
	if (!normalizedPeriod) return {};

	const now = new Date();

	if (normalizedPeriod === "daily") {
		if (String(day).trim()) {
			const [yearPart, monthPart, dayPart] = String(day).trim().split("-");
			if (!yearPart || !monthPart || !dayPart || !isValidInteger(yearPart) || !isValidInteger(monthPart) || !isValidInteger(dayPart)) {
				return { error: "Invalid day format. Use YYYY-MM-DD." };
			}

			const range = createDayRange(Number(yearPart), Number(monthPart), Number(dayPart));
			if (!range) return { error: "Invalid day value." };
			return range;
		}

		return createDayRange(now.getFullYear(), now.getMonth() + 1, now.getDate());
	}

	if (normalizedPeriod === "weekly") {
		const start = new Date(now);
		start.setDate(now.getDate() - 7);
		return { start, end: now };
	}

	if (normalizedPeriod === "monthly") {
		const selectedYear = String(year).trim()
			? Number(year)
			: now.getFullYear();
		const selectedMonth = String(month).trim()
			? Number(month)
			: now.getMonth() + 1;

		if (!Number.isInteger(selectedYear) || selectedYear < 1900 || selectedYear > 3000) {
			return { error: "Invalid year value." };
		}

		if (!Number.isInteger(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
			return { error: "Invalid month value." };
		}

		const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
		const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
		return { start, end };
	}

	if (normalizedPeriod === "yearly") {
		const selectedYear = String(year).trim()
			? Number(year)
			: now.getFullYear();

		if (!Number.isInteger(selectedYear) || selectedYear < 1900 || selectedYear > 3000) {
			return { error: "Invalid year value." };
		}

		const start = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
		const end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
		return { start, end };
	}

	return {};
};

export const applyPeriodDateFilter = (query, fieldName, filterOptions = {}) => {
	const { start, end, error } = getDateRangeForPeriod(filterOptions);
	if (error) return { error };

	if (start && end) {
		query[fieldName] = { $gte: start, $lte: end };
	}

	return {};
};
