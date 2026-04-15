import Table from "react-bootstrap/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const StudentHistoryTable = ({ items = [] }) => (
  <Table responsive hover className="align-middle data-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Method</th>
        <th>Date</th>
        <th className="text-end">Amount</th>
      </tr>
    </thead>
    <tbody>
      {items.length ? (
        items.map((item) => (
          <tr key={item._id}>
            <td>{item.title || "Fee payment"}</td>
            <td>
              <span className="method-chip text-capitalize">{item.paymentMethod}</span>
            </td>
            <td>{formatDate(item.incomeDate)}</td>
            <td className="text-end amount-strong">{formatCurrency(item.amount)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="text-center text-muted py-4">
            No income history
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default StudentHistoryTable;
