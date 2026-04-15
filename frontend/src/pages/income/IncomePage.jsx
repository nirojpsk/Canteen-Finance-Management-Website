import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FiDownload, FiFilter, FiShield, FiTrendingUp } from "react-icons/fi";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import IncomeForm from "../../components/income/IncomeForm";
import IncomeTable from "../../components/income/IncomeTable";
import {
  useCreateIncomeMutation,
  useDeleteIncomeMutation,
  useGetAllIncomeQuery,
} from "../../features/income/incomeApiSlice";
import { useGetAllStudentsQuery } from "../../features/students/studentApiSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import getErrorMessage from "../../utils/getErrorMessage";

const IncomePage = () => {
  const [filters, setFilters] = useState({ search: "", paymentMethod: "", period: "" });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const queryParams = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    [filters],
  );

  const incomeQuery = useGetAllIncomeQuery(queryParams);
  const studentsQuery = useGetAllStudentsQuery({ status: "active" });
  const [createIncome, createState] = useCreateIncomeMutation();
  const [deleteIncome, deleteState] = useDeleteIncomeMutation();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (data) => {
    setMessage("");
    setErrorMessage("");
    try {
      const response = await createIncome(data).unwrap();
      setMessage(response.message || "Income added");
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to add income"));
      return false;
    }
  };

  const handleDelete = async () => {
    setErrorMessage("");
    try {
      await deleteIncome(deleteId).unwrap();
      setDeleteId("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to delete income"));
    }
  };

  return (
    <section className="page-stack income-screen">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Revenue</p>
          <h2>Income</h2>
          <p className="page-subtitle">Record payments and reconcile student account receipts.</p>
        </div>
        <div className="metric-pill">Total {formatCurrency(incomeQuery.data?.totalIncome)}</div>
      </div>

      <div className="finance-top-grid">
        <Card className="panel-card finance-form-card">
          <Card.Body>
            <h3>Record Payment</h3>
            <p>Enter new income details for reconciliation.</p>
            <Message variant="success">{message}</Message>
            <Message variant="danger">{errorMessage}</Message>
            <IncomeForm
              students={studentsQuery.data?.students || []}
              isLoading={createState.isLoading}
              onSubmit={handleCreate}
            />
          </Card.Body>
        </Card>

        <div className="finance-visual-stack">
          <section className="finance-hero finance-hero-income">
            <span>Current Quarter</span>
            <h3>Fiscal Clarity.</h3>
          </section>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <FiTrendingUp aria-hidden="true" />
              <span>Growth vs Prev Month</span>
              <strong>+12.4%</strong>
            </div>
            <div className="mini-stat">
              <FiShield aria-hidden="true" />
              <span>Settled Transactions</span>
              <strong>{incomeQuery.data?.incomes?.length || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <section className="ledger-card transaction-ledger">
        <div className="section-title-row transaction-title-row">
          <div>
            <h3>Transaction Log</h3>
            <p>Historical record of all canteen income.</p>
          </div>
          <div className="ledger-tools">
            <button type="button">
              <FiFilter aria-hidden="true" />
              Filter
            </button>
            <button type="button">
              <FiDownload aria-hidden="true" />
              Export
            </button>
          </div>
        </div>
        <Row className="g-3 mb-3">
          <Col md={5}>
            <Form.Control
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search student, title, note"
            />
          </Col>
          <Col md={3}>
            <Form.Select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
            >
              <option value="">All methods</option>
              <option value="cash">Cash</option>
              <option value="esewa">Esewa</option>
              <option value="khalti">Khalti</option>
              <option value="bank">Bank</option>
              <option value="other">Other</option>
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
        {incomeQuery.isLoading ? <Loader /> : null}
        <Message variant="danger">
          {incomeQuery.isError ? getErrorMessage(incomeQuery.error) : ""}
        </Message>
        <IncomeTable
          items={incomeQuery.data?.incomes || []}
          deletingId={deleteState.isLoading ? deleteId : ""}
          onDelete={setDeleteId}
        />
        <div className="ledger-footer">Showing current period transactions.</div>
      </section>

      <ConfirmationModal
        show={Boolean(deleteId)}
        title="Delete income"
        message="This income entry will be permanently deleted."
        confirmLabel="Delete"
        isLoading={deleteState.isLoading}
        onCancel={() => setDeleteId("")}
        onConfirm={handleDelete}
      />
    </section>
  );
};

export default IncomePage;
