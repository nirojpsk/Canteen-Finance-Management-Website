import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
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
import { formatDate } from "../../utils/formatDate";
import getErrorMessage from "../../utils/getErrorMessage";
import { FiCalendar, FiCreditCard, FiTrendingUp, FiUsers } from "react-icons/fi";

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

  const incomes = incomeQuery.data?.incomes || [];

  const incomeStats = useMemo(() => {
    const latestIncome = incomes.reduce((latest, entry) => {
      const currentDate = new Date(entry.incomeDate || 0).getTime();
      const latestDate = new Date(latest?.incomeDate || 0).getTime();
      return currentDate > latestDate ? entry : latest;
    }, incomes[0]);

    return {
      count: incomes.length,
      averageIncome: incomes.length ? (incomeQuery.data?.totalIncome || 0) / incomes.length : 0,
      latestIncome,
    };
  }, [incomeQuery.data?.totalIncome, incomes]);

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
          <Card className="finance-hero finance-hero-income">
            <span>Income overview</span>
            <h3>{formatCurrency(incomeQuery.data?.totalIncome)}</h3>
            <p>
              Track incoming payments, review recent receipts, and keep your canteen accounts clean.
            </p>
            <div className="income-hero-badges">
              <div>
                <strong>{incomeStats.count}</strong>
                <span>Transactions</span>
              </div>
              <div>
                <strong>{studentsQuery.data?.students?.length || 0}</strong>
                <span>Active students</span>
              </div>
              <div>
                <strong>{formatCurrency(incomeStats.averageIncome)}</strong>
                <span>Average payment</span>
              </div>
            </div>
          </Card>

          <div className="mini-stat-grid">
            <Card className="mini-stat">
              <FiCreditCard aria-hidden="true" />
              <span>Collected total</span>
              <strong>{formatCurrency(incomeQuery.data?.totalIncome)}</strong>
            </Card>
            <Card className="mini-stat">
              <FiUsers aria-hidden="true" />
              <span>Students tracked</span>
              <strong>{studentsQuery.data?.students?.length || 0}</strong>
            </Card>
            <Card className="mini-stat">
              <FiTrendingUp aria-hidden="true" />
              <span>Entries logged</span>
              <strong>{incomeStats.count}</strong>
            </Card>
            <Card className="mini-stat">
              <FiCalendar aria-hidden="true" />
              <span>Latest income</span>
              <strong>{incomeStats.latestIncome ? formatDate(incomeStats.latestIncome.incomeDate) : "-"}</strong>
            </Card>
          </div>
        </div>
      </div>

      <section className="ledger-card transaction-ledger">
        <div className="section-title-row transaction-title-row">
          <div>
            <h3>Transaction Log</h3>
            <p>Historical record of all canteen income.</p>
          </div>
        </div>
        <Card className="panel-card income-filter-card mb-3">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col lg={5}>
                <Form.Control
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search student, title, note"
                />
              </Col>
              <Col sm={6} lg={3}>
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
                <div className="income-filter-count">{incomes.length}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {incomeQuery.isLoading ? <Loader /> : null}
        <Message variant="danger">
          {incomeQuery.isError ? getErrorMessage(incomeQuery.error) : ""}
        </Message>
        <IncomeTable
          items={incomes}
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
