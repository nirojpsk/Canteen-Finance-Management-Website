import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { FiSquare, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const ExpenseTable = ({ items = [], deletingId = "", onDelete }) => (
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
      {items.length ? (
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
            No expenses found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
  </div>
);

export default ExpenseTable;
