import Table from "react-bootstrap/Table";
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

const RecentIncomeTable = ({ items = [] }) => (
  <Table responsive hover className="align-middle data-table">
    <thead>
      <tr>
        <th>Student</th>
        <th>Amount</th>
        <th>Date</th>
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
            No recent income
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default RecentIncomeTable;
