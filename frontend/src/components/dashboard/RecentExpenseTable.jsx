import Table from "react-bootstrap/Table";
import { FiBox, FiTrendingDown, FiZap } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const skeletonRows = Array.from({ length: 3 }, (_, index) => index);

const RecentExpenseTable = ({ items = [], isLoading = false }) => (
  <Table responsive hover className="align-middle data-table">
    <thead>
      <tr>
        <th>Vendor</th>
        <th>Amount</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        skeletonRows.map((row) => (
          <tr key={`recent-expense-skeleton-${row}`} className="skeleton-row">
            <td colSpan="3">
              <span className="skeleton-line w-55" />
              <span className="skeleton-line w-30 mt-2" />
            </td>
          </tr>
        ))
      ) : items.length ? (
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
            <div className="table-empty-state">
              <FiTrendingDown aria-hidden="true" />
              <div>
                <strong>No recent expenses</strong>
                <small>Vendor and operations costs will show up here.</small>
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default RecentExpenseTable;
