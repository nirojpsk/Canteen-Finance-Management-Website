import Table from "react-bootstrap/Table";
import { FiBox, FiZap } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const RecentExpenseTable = ({ items = [] }) => (
  <Table responsive hover className="align-middle data-table">
    <thead>
      <tr>
        <th>Vendor</th>
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
                <span className="avatar avatar-icon">
                  {item.category === "electricity" ? (
                    <FiZap aria-hidden="true" />
                  ) : (
                    <FiBox aria-hidden="true" />
                  )}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small className="text-capitalize">{item.category}</small>
                </span>
              </div>
            </td>
            <td className="amount-negative">{formatCurrency(item.amount)}</td>
            <td>{formatDate(item.expenseDate)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="text-center text-muted py-4">
            No recent expenses
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default RecentExpenseTable;
