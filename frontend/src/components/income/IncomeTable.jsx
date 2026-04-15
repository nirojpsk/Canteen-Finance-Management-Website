import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { FiTrash2 } from "react-icons/fi";
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

const IncomeTable = ({ items = [], deletingId = "", onDelete }) => (
  <Table responsive hover className="align-middle data-table">
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
      {items.length ? (
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
          <td colSpan="6" className="text-center text-muted py-4">
            No income entries found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default IncomeTable;
