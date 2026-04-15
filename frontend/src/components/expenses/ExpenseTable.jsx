import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { FiSquare, FiTrash2, FiTrendingDown } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

const ExpenseTable = ({ items = [], deletingId = "", onDelete, isLoading = false }) => (
  <div className="expense-table-shell">
    <Table responsive hover className="align-middle data-table expense-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Category</th>
        <th>Date</th>
        <th className="text-end">Amount</th>
        <th className="text-end">Actions</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        skeletonRows.map((row) => (
          <tr key={`expense-skeleton-${row}`} className="skeleton-row">
            <td colSpan="5">
              <span className="skeleton-line w-72" />
              <span className="skeleton-line w-38 mt-2" />
            </td>
          </tr>
        ))
      ) : items.length ? (
        items.map((item) => (
          <tr key={item._id}>
            <td>
              <div className="identity-cell">
                <span className="expense-dot" aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  {item.note ? <small>{item.note}</small> : null}
                </span>
              </div>
            </td>
            <td>
              <span className="method-chip text-capitalize">
                <FiSquare aria-hidden="true" />
                {item.category}
              </span>
            </td>
            <td>{formatDate(item.expenseDate)}</td>
            <td className="text-end amount-negative">{formatCurrency(item.amount)}</td>
            <td>
              <div className="table-actions">
                <Button
                  variant="outline-danger"
                  size="sm"
                  title="Delete expense"
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
          <td colSpan="5" className="text-center text-muted py-5 expense-empty-state">
            <div className="table-empty-state">
              <FiTrendingDown aria-hidden="true" />
              <div>
                <strong>No expenses found</strong>
                <small>Logged expenses will appear once transactions are recorded.</small>
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </Table>
  </div>
);

export default ExpenseTable;
