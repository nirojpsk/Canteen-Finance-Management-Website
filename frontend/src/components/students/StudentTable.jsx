import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { FiEdit2, FiEye, FiRefreshCw } from "react-icons/fi";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ST";

const StudentTable = ({ students = [], onToggleStatus, togglingId = "" }) => (
  <Table responsive hover className="align-middle data-table student-table">
    <thead>
      <tr>
        <th>Full Name</th>
        <th>Class</th>
        <th>Roll</th>
        <th>Phone</th>
        <th>Status</th>
        <th className="text-end">Actions</th>
      </tr>
    </thead>
    <tbody>
      {students.length ? (
        students.map((student) => (
          <tr key={student._id}>
            <td>
              <div className="identity-cell">
                {student.profilePicture ? (
                  <img className="avatar" src={student.profilePicture} alt="" />
                ) : (
                  <span className="avatar avatar-soft">{getInitials(student.fullName)}</span>
                )}
                <span>
                  <strong>{student.fullName}</strong>
                  <small>{student.address || "canteen.finance"}</small>
                </span>
              </div>
            </td>
            <td>
              {student.className}
              {student.section ? ` - ${student.section}` : ""}
            </td>
            <td>{student.rollNumber || "-"}</td>
            <td>{student.phone || "-"}</td>
            <td>
              <Badge bg={student.isActive ? "success" : "secondary"}>
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
            </td>
            <td>
              <div className="table-actions">
                <Button
                  as={Link}
                  to={`/students/${student._id}`}
                  variant="outline-secondary"
                  size="sm"
                  title="View student"
                >
                  <FiEye aria-hidden="true" />
                </Button>
                <Button
                  as={Link}
                  to={`/students/${student._id}/edit`}
                  variant="outline-primary"
                  size="sm"
                  title="Edit student"
                >
                  <FiEdit2 aria-hidden="true" />
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  title="Toggle status"
                  onClick={() => onToggleStatus(student._id)}
                  disabled={togglingId === student._id}
                >
                  <FiRefreshCw aria-hidden="true" />
                </Button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" className="text-center text-muted py-4">
            No students found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default StudentTable;
