import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { FiTrendingUp, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IN";

const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

const IncomeTable = ({ items = [], deletingId = "", onDelete, isLoading = false }) => (
  <div className="income-table-shell">
    <Table responsive hover className="align-middle data-table income-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Title</th>
          <th>Method</th>
          <th>Date</th>
          <th className="text-end">Amount</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          skeletonRows.map((row) => (
            <tr key={`income-skeleton-${row}`} className="skeleton-row">
              <td colSpan="6">
                <span className="skeleton-line w-75" />
                <span className="skeleton-line w-45 mt-2" />
              </td>
            </tr>
          ))
        ) : items.length ? (
          items.map((item) => (
            <tr key={item._id}>
              <td>
                <div className="identity-cell">
                  <span className="avatar avatar-soft">{getInitials(item.student?.fullName)}</span>
                  <span>
                    <strong>{item.student?.fullName || "Unknown student"}</strong>
                    <small>
                      {item.student?.className || "-"} {item.student?.rollNumber || ""}
                    </small>
                  </span>
                </div>
              </td>
              <td>{item.title || "Fee payment"}</td>
              <td>
                <span className="method-chip text-capitalize">{item.paymentMethod}</span>
              </td>
              <td>{formatDate(item.incomeDate)}</td>
              <td className="text-end amount-strong">{formatCurrency(item.amount)}</td>
              <td>
                <div className="table-actions">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Delete income"
                    onClick={() => onDelete(item._id)}
                    disabled={deletingId === item._id}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center text-muted py-5 income-empty-state">
              <div className="table-empty-state">
                <FiTrendingUp aria-hidden="true" />
                <div>
                  <strong>No income entries found</strong>
                  <small>Add a payment to start building your revenue history.</small>
                </div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);

export default IncomeTable;
