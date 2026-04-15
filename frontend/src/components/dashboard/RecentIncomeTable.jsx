import Table from "react-bootstrap/Table";
import { FiTrendingUp } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CF";

const skeletonRows = Array.from({ length: 3 }, (_, index) => index);

const RecentIncomeTable = ({ items = [], isLoading = false }) => (
  <Table responsive hover className="align-middle data-table">
    <thead>
      <tr>
        <th>Student</th>
        <th>Amount</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        skeletonRows.map((row) => (
          <tr key={`recent-income-skeleton-${row}`} className="skeleton-row">
            <td colSpan="3">
              <span className="skeleton-line w-60" />
              <span className="skeleton-line w-35 mt-2" />
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
                    {item.student?.className || "-"} {item.student?.section || ""}
                  </small>
                </span>
              </div>
            </td>
            <td className="amount-positive">{formatCurrency(item.amount)}</td>
            <td>{formatDate(item.incomeDate)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="text-center text-muted py-4">
            <div className="table-empty-state">
              <FiTrendingUp aria-hidden="true" />
              <div>
                <strong>No recent income</strong>
                <small>New payment entries will appear here.</small>
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default RecentIncomeTable;
