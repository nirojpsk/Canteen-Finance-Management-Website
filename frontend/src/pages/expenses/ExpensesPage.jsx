import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FiAward, FiDownload, FiTrendingUp } from "react-icons/fi";
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
          <section className="finance-hero finance-hero-expense">
            <h3>Financial Transparency</h3>
            <p>Real-time expenditure tracking for the current fiscal quarter.</p>
          </section>

          <section className="ledger-card">
            <div className="section-title-row">
              <div>
                <h3>Recent Ledger</h3>
              </div>
              <button type="button" className="link-button">
                <FiDownload aria-hidden="true" />
                Export PDF
              </button>
            </div>
            <Row className="g-3 mb-3">
              <Col md={5}>
                <Form.Control
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search title, category, note"
                />
              </Col>
              <Col md={3}>
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
              <Col md={4}>
                <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                  <option value="">All time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Form.Select>
              </Col>
            </Row>
            {expensesQuery.isLoading ? <Loader /> : null}
            <Message variant="danger">
              {expensesQuery.isError ? getErrorMessage(expensesQuery.error) : ""}
            </Message>
            <ExpenseTable
              items={expensesQuery.data?.expenses || []}
              deletingId={deleteState.isLoading ? deleteId : ""}
              onDelete={setDeleteId}
            />
            <div className="ledger-footer">View full transaction history</div>
          </section>

          <div className="mini-stat-grid expense-stats">
            <div className="mini-stat">
              <FiTrendingUp aria-hidden="true" />
              <span>MoM Increase</span>
              <strong>+12.4%</strong>
            </div>
            <div className="mini-stat">
              <FiAward aria-hidden="true" />
              <span>Audited Status</span>
              <strong>Verified</strong>
            </div>
          </div>
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
