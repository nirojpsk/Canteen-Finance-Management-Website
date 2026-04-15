import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { FiEdit2, FiEye, FiRefreshCw, FiUsers } from "react-icons/fi";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ST";

const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

const StudentTable = ({ students = [], onToggleStatus, togglingId = "", isLoading = false }) => (
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
      {isLoading ? (
        skeletonRows.map((row) => (
          <tr key={`student-skeleton-${row}`} className="skeleton-row">
            <td colSpan="6">
              <span className="skeleton-line w-70" />
              <span className="skeleton-line w-40 mt-2" />
            </td>
          </tr>
        ))
      ) : students.length ? (
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
                  onClick={() => onToggleStatus(student)}
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
            <div className="table-empty-state">
              <FiUsers aria-hidden="true" />
              <div>
                <strong>No students found</strong>
                <small>Try adjusting filters or add a new student profile.</small>
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default StudentTable;
