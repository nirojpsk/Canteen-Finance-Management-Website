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

const ExpensesPage = () => {
  const [filters, setFilters] = useState({ search: "", category: "", period: "" });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const queryParams = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    [filters],
  );

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
    setFilters((current) => ({ ...current, [name]: value }));
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
                <Row className="g-3 align-items-center">
                  <Col lg={5}>
                    <Form.Control
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search title, category, note"
                    />
                  </Col>
                  <Col sm={6} lg={3}>
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
                  <Col sm={6} lg={3}>
                    <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                      <option value="">All time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </Form.Select>
                  </Col>
                  <Col lg={1}>
                    <div className="expense-filter-count">{expenses.length}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {expensesQuery.isLoading ? <Loader /> : null}
            <Message variant="danger">
              {expensesQuery.isError ? getErrorMessage(expensesQuery.error) : ""}
            </Message>
            <ExpenseTable items={expenses} deletingId={deleteState.isLoading ? deleteId : ""} onDelete={setDeleteId} />
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
        message="This expense entry will be permanently deleted."
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onCancel={() => setDeleteId("")}
        onConfirm={handleDelete}
      />
    </section>
  );
};

export default ExpensesPage;
