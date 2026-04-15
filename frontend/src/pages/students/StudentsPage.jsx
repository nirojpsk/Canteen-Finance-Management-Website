import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FiUserPlus } from "react-icons/fi";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import StudentForm from "../../components/students/StudentForm";
import StudentTable from "../../components/students/StudentTable";
import {
  useCreateStudentMutation,
  useGetAllStudentsQuery,
  useToggleStudentStatusMutation,
} from "../../features/students/studentApiSlice";
import getErrorMessage from "../../utils/getErrorMessage";

const StudentsPage = () => {
  const [filters, setFilters] = useState({ search: "", status: "active", className: "" });
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState("");

  const queryParams = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    [filters],
  );

  const studentsQuery = useGetAllStudentsQuery(queryParams);
  const [createStudent, createState] = useCreateStudentMutation();
  const [toggleStatus] = useToggleStudentStatusMutation();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleCreateStudent = async (data) => {
    setFormMessage("");
    setFormError("");

    try {
      const response = await createStudent(data).unwrap();
      setFormMessage(response.message || "Student created");
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to create student"));
    }
  };

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await toggleStatus(id).unwrap();
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update student status"));
    } finally {
      setTogglingId("");
    }
  };

  return (
    <section className="page-stack students-screen">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student Registry</p>
          <h2>Students</h2>
          <p className="page-subtitle">
            Manage enrollment records, profile details, and financial standing of the student body.
          </p>
        </div>
      </div>

      <div className="students-grid">
        <Card className="panel-card registration-card">
          <Card.Body>
            <div className="card-title-with-icon">
              <FiUserPlus aria-hidden="true" />
              <h3>Student Registration</h3>
            </div>
            <Message variant="success">{formMessage}</Message>
            <Message variant="danger">{formError}</Message>
            <div className="student-registration">
              <StudentForm
                onSubmit={handleCreateStudent}
                isLoading={createState.isLoading}
                submitLabel="Register Profile"
              />
            </div>
          </Card.Body>
        </Card>

        <div className="registry-panel">
          <Card className="panel-card filter-card">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col lg={5}>
                  <Form.Label>Search Registry</Form.Label>
                  <Form.Control
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name, roll, or phone"
                  />
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Label>Class</Form.Label>
                  <Form.Control
                    name="className"
                    value={filters.className}
                    onChange={handleFilterChange}
                    placeholder="All Classes"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <section className="ledger-card student-ledger">
            {studentsQuery.isLoading ? <Loader /> : null}
            <Message variant="danger">
              {studentsQuery.isError ? getErrorMessage(studentsQuery.error) : ""}
            </Message>
            <StudentTable
              students={studentsQuery.data?.students || []}
              onToggleStatus={handleToggleStatus}
              togglingId={togglingId}
            />
            <div className="ledger-footer">
              Showing <strong>{studentsQuery.data?.students?.length || 0}</strong> students
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default StudentsPage;
