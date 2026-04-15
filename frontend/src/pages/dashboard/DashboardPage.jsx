import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import AnalyticsSection from "../../components/dashboard/AnalyticsSection";
import RecentExpenseTable from "../../components/dashboard/RecentExpenseTable";
import RecentIncomeTable from "../../components/dashboard/RecentIncomeTable";
import SummaryCard from "../../components/dashboard/SummaryCard";
import {
  useGetDashboardOverviewQuery,
  useGetDashboardStatsByPeriodQuery,
  useGetDashboardSummaryQuery,
  useGetRecentTransactionsQuery,
} from "../../features/dashboard/dashboardApiSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import getErrorMessage from "../../utils/getErrorMessage";

const periodOptions = ["daily", "weekly", "monthly", "yearly"];
const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const DashboardPage = () => {
  const [filters, setFilters] = useState({
    period: "",
    day: "",
    month: "",
    year: "",
  });
  const queryParams = useMemo(() => {
    const params = { period: filters.period };

    if (filters.period === "daily" && filters.day) {
      params.day = filters.day;
    }

    if (filters.period === "monthly") {
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
    }

    if (filters.period === "yearly" && filters.year) {
      params.year = filters.year;
    }

    return Object.fromEntries(Object.entries(params).filter(([, value]) => value));
  }, [filters]);
  const summaryQuery = useGetDashboardSummaryQuery();
  const overviewQuery = useGetDashboardOverviewQuery(queryParams);
  const statsQuery = useGetDashboardStatsByPeriodQuery(queryParams);
  const recentQuery = useGetRecentTransactionsQuery();

  const summary = summaryQuery.data?.summary;
  const stats = statsQuery.data?.stats;
  const totalIncome = summary?.finance?.totalIncome ?? 0;
  const totalExpenses = summary?.finance?.totalExpenses ?? 0;
  const netProfit = totalIncome - totalExpenses;
  const selectedPeriodLabel = filters.period ? filters.period : "all time";
  const totalPeriodEntries = (stats?.totalIncomeEntries ?? 0) + (stats?.totalExpenseEntries ?? 0);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => {
      if (name !== "period") {
        return { ...current, [name]: value };
      }

      return {
        ...current,
        period: value,
        day: "",
        month: "",
        year: "",
      };
    });
  };

  return (
    <section className="page-stack dashboard-screen">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">Live performance</p>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Overview of canteen revenue, expenses, and student activity.</p>
        </div>
      </div>

      {summaryQuery.isLoading ? <Loader /> : null}
      <Message variant="danger">
        {summaryQuery.isError ? getErrorMessage(summaryQuery.error) : ""}
      </Message>

      <div className="dashboard-metrics">
        <SummaryCard
          label="Net Profit"
          value={formatCurrency(netProfit)}
          tone={(netProfit ?? 0) >= 0 ? "primary" : "danger"}
        />
        <SummaryCard
          label="Total Students"
          value={summary?.students?.total ?? 0}
          helper={`${summary?.students?.active ?? 0} active / ${summary?.students?.inactive ?? 0} inactive`}
        />
        <SummaryCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          tone="success"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          tone="danger"
        />
      </div>

      <Card className="panel-card dashboard-filter-card">
        <Card.Body>
          <Row className="g-3 align-items-center filter-toolbar dashboard-filter-toolbar">
            <Col sm={6} md={3} lg={3} className="filter-select-col">
              <Form.Label>Period</Form.Label>
              <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                <option value="">All time</option>
                {periodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option[0].toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            {filters.period === "daily" ? (
              <Col sm={6} md={3} lg={3} className="filter-select-col">
                <Form.Label>Day</Form.Label>
                <Form.Control
                  type="date"
                  name="day"
                  value={filters.day}
                  onChange={handleFilterChange}
                  aria-label="Choose day"
                />
              </Col>
            ) : null}
            {filters.period === "monthly" ? (
              <>
                <Col sm={6} md={3} lg={3} className="filter-select-col">
                  <Form.Label>Month</Form.Label>
                  <Form.Select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    aria-label="Choose month"
                  >
                    <option value="">Month</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm={6} md={3} lg={3} className="filter-select-col">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="1900"
                    max="3000"
                    step="1"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    placeholder="Year"
                    aria-label="Choose year"
                  />
                </Col>
              </>
            ) : null}
            {filters.period === "yearly" ? (
              <Col sm={6} md={3} lg={3} className="filter-select-col">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  min="1900"
                  max="3000"
                  step="1"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  placeholder="Year"
                  aria-label="Choose year"
                />
              </Col>
            ) : null}
            <Col xs={12} sm={4} md={12} lg={2} className="filter-count-col">
              <div className="dashboard-filter-count table-count-pill">
                <strong>{totalPeriodEntries}</strong>
                <span>Entries</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="dashboard-ledgers">
        <section className="ledger-card">
          <div className="section-title-row">
            <div>
              <h3>Recent Income</h3>
              <p>Last 5 transactions from student portals</p>
            </div>
            <Link to="/income">View All</Link>
          </div>
          <RecentIncomeTable items={recentQuery.data?.recentIncome || []} isLoading={recentQuery.isLoading} />
        </section>
        <section className="ledger-card">
          <div className="section-title-row">
            <div>
              <h3>Recent Expenses</h3>
              <p>Vendor payments and operational costs</p>
            </div>
            <Link to="/expenses">View All</Link>
          </div>
          <RecentExpenseTable items={recentQuery.data?.recentExpenses || []} isLoading={recentQuery.isLoading} />
        </section>
      </div>

      <div className="period-strip dashboard-period-strip">
        <div>
          <p className="summary-label">Period Income</p>
          <strong>{formatCurrency(stats?.totalIncome)}</strong>
        </div>
        <div>
          <p className="summary-label">Period Expenses</p>
          <strong>{formatCurrency(stats?.totalExpenses)}</strong>
        </div>
        <div>
          <p className="summary-label">{selectedPeriodLabel} Profit</p>
          <strong>{formatCurrency(stats?.netProfit)}</strong>
          <span>
            {statsQuery.isFetching
              ? "Refreshing"
              : `${stats?.totalIncomeEntries ?? 0} income / ${stats?.totalExpenseEntries ?? 0} expenses`}
          </span>
        </div>
      </div>

      {overviewQuery.isError ? (
        <Message variant="danger">{getErrorMessage(overviewQuery.error, "Unable to load analytics graph data.")}</Message>
      ) : null}
      <AnalyticsSection overview={overviewQuery.data?.overview} />
    </section>
  );
};

export default DashboardPage;
