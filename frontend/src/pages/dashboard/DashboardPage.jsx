import { useState } from "react";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import RecentExpenseTable from "../../components/dashboard/RecentExpenseTable";
import RecentIncomeTable from "../../components/dashboard/RecentIncomeTable";
import SummaryCard from "../../components/dashboard/SummaryCard";
import {
  useGetDashboardStatsByPeriodQuery,
  useGetDashboardSummaryQuery,
  useGetRecentTransactionsQuery,
} from "../../features/dashboard/dashboardApiSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import getErrorMessage from "../../utils/getErrorMessage";

const periodOptions = ["daily", "weekly", "monthly", "yearly"];

const DashboardPage = () => {
  const [period, setPeriod] = useState("daily");
  const summaryQuery = useGetDashboardSummaryQuery();
  const statsQuery = useGetDashboardStatsByPeriodQuery(period);
  const recentQuery = useGetRecentTransactionsQuery();

  const summary = summaryQuery.data?.summary;
  const stats = statsQuery.data?.stats;
  const totalIncome = summary?.finance?.totalIncome ?? 0;
  const totalExpenses = summary?.finance?.totalExpenses ?? 0;
  const netProfit = totalIncome - totalExpenses;

  return (
    <section className="page-stack dashboard-screen">
      <div className="page-heading dashboard-heading">
        <div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Overview of canteen revenue, expenses, and student activity.</p>
        </div>
        <Form.Select
          className="period-select"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Dashboard period"
        >
          {periodOptions.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </Form.Select>
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

      <div className="dashboard-ledgers">
        <section className="ledger-card">
          <div className="section-title-row">
            <div>
              <h3>Recent Income</h3>
              <p>Last 5 transactions from student portals</p>
            </div>
            <Link to="/income">View All</Link>
          </div>
          <RecentIncomeTable items={recentQuery.data?.recentIncome || []} />
        </section>
        <section className="ledger-card">
          <div className="section-title-row">
            <div>
              <h3>Recent Expenses</h3>
              <p>Vendor payments and operational costs</p>
            </div>
            <Link to="/expenses">View All</Link>
          </div>
          <RecentExpenseTable items={recentQuery.data?.recentExpenses || []} />
        </section>
      </div>

      <div className="period-strip">
        <div>
          <p className="summary-label">Period Income</p>
          <strong>{formatCurrency(stats?.totalIncome)}</strong>
        </div>
        <div>
          <p className="summary-label">Period Expenses</p>
          <strong>{formatCurrency(stats?.totalExpenses)}</strong>
        </div>
        <div>
          <p className="summary-label">{period} Profit</p>
          <strong>{formatCurrency(stats?.netProfit)}</strong>
          <span>
            {statsQuery.isFetching
              ? "Refreshing"
              : `${stats?.totalIncomeEntries ?? 0} income / ${stats?.totalExpenseEntries ?? 0} expenses`}
          </span>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
