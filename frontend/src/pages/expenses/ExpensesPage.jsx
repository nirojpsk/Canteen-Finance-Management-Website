import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetAllExpensesQuery,
} from "../../features/expenses/expenseApiSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import getErrorMessage from "../../utils/getErrorMessage";

const categories = ["stock", "drinks", "gas", "salary", "rent", "electricity", "miscellaneous"];
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

const ExpensesPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    period: "",
    day: "",
    month: "",
    year: "",
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const queryParams = useMemo(() => {
    const params = {
      search: filters.search,
      category: filters.category,
      period: filters.period,
    };

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

  const expensesQuery = useGetAllExpensesQuery(queryParams);
  const [createExpense, createState] = useCreateExpenseMutation();
  const [deleteExpense, deleteState] = useDeleteExpenseMutation();

  const expenses = expensesQuery.data?.expenses || [];

  const expenseStats = useMemo(() => {
    const latestExpense = expenses.reduce((latest, entry) => {
      const currentDate = new Date(entry.expenseDate || 0).getTime();
      const latestDate = new Date(latest?.expenseDate || 0).getTime();
      return currentDate > latestDate ? entry : latest;
    }, expenses[0]);

    return {
      count: expenses.length,
      averageExpense: expenses.length ? (expensesQuery.data?.totalExpense || 0) / expenses.length : 0,
      latestExpense,
    };
  }, [expenses, expensesQuery.data?.totalExpense]);

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

  const handleCreate = async (data) => {
    setMessage("");
    setErrorMessage("");
    try {
      const response = await createExpense(data).unwrap();
      setMessage(response.message || "Expense added");
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to add expense"));
      return false;
    }
  };

  const handleDelete = async () => {
    setErrorMessage("");
    try {
      await deleteExpense(deleteId).unwrap();
      setDeleteId("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to delete expense"));
    }
  };

  return (
    <section className="page-stack expenses-screen">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Detailed Ledger & Cost Analysis</p>
          <h2>Expenses</h2>
          <p className="page-subtitle">Track operational spend, vendor costs, and budget movement.</p>
        </div>
        <div className="metric-pill metric-danger">
          Total Monthly Burn {formatCurrency(expensesQuery.data?.totalExpense)}
        </div>
      </div>

      <div className="finance-top-grid expenses-grid">
        <Card className="panel-card finance-form-card">
          <Card.Body>
            <h3>Log New Expense</h3>
            <Message variant="success">{message}</Message>
            <Message variant="danger">{errorMessage}</Message>
            <ExpenseForm isLoading={createState.isLoading} onSubmit={handleCreate} />
          </Card.Body>
        </Card>

        <div className="expense-ledger-column">
          <Card className="panel-card ledger-card expense-ledger-card">
            <Card.Body>
            <div className="section-title-row">
              <div>
                <h3>Recent Ledger</h3>
                <p>Latest entries and fast filters for expense review.</p>
              </div>
              <div className="ledger-summary-strip">
                <div>
                  <span>Entries</span>
                  <strong>{expenseStats.count}</strong>
                </div>
                <div>
                  <span>Burn</span>
                  <strong>{formatCurrency(expensesQuery.data?.totalExpense)}</strong>
                </div>
                <div>
                  <span>Avg.</span>
                  <strong>{formatCurrency(expenseStats.averageExpense)}</strong>
                </div>
              </div>
            </div>
            <Card className="panel-card expense-filter-card mb-3">
              <Card.Body>
                <Row className="g-3 align-items-center filter-toolbar">
                  <Col md={6} lg={4}>
                    <Form.Control
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search title, category, note"
                    />
                  </Col>
                  <Col sm={6} md={3} lg={3} className="filter-select-col">
                    <Form.Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category[0].toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6} md={3} lg={3} className="filter-select-col">
                    <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                      <option value="">All time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </Form.Select>
                  </Col>
                  {filters.period === "daily" ? (
                    <Col sm={6} md={3} lg={2} className="filter-select-col">
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
                      <Col sm={6} md={3} lg={2} className="filter-select-col">
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
                      <Col sm={6} md={3} lg={2} className="filter-select-col">
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
                    <Col sm={6} md={3} lg={2} className="filter-select-col">
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
                    <div className="expense-filter-count table-count-pill">
                      <strong>{expenses.length}</strong>
                      <span>Rows</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {expensesQuery.isLoading ? <Loader /> : null}
            <Message variant="danger">
              {expensesQuery.isError ? getErrorMessage(expensesQuery.error) : ""}
            </Message>
            <ExpenseTable
              items={expenses}
              deletingId={deleteState.isLoading ? deleteId : ""}
              onDelete={setDeleteId}
              isLoading={expensesQuery.isLoading}
            />
            <div className="ledger-footer">
              View full transaction history
              {expenseStats.latestExpense ? ` · Latest: ${formatDate(expenseStats.latestExpense.expenseDate)}` : ""}
            </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ConfirmationModal
        show={Boolean(deleteId)}
        title="Delete expense"
        message="Are u sure, u want to delete?"
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onCancel={() => setDeleteId("")}
        onConfirm={handleDelete}
      />
    </section>
  );
};

export default ExpensesPage;
