import { useState } from "react";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useParams } from "react-router-dom";
import { FiDownload, FiEdit2, FiMapPin } from "react-icons/fi";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import StudentHistoryTable from "../../components/students/StudentHistoryTable";
import {
  useGetStudentByIdQuery,
  useGetStudentIncomeHistoryQuery,
} from "../../features/students/studentApiSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import getErrorMessage from "../../utils/getErrorMessage";

const StudentDetailsPage = () => {
  const { id } = useParams();
  const [period, setPeriod] = useState("");
  const studentQuery = useGetStudentByIdQuery(id);
  const historyQuery = useGetStudentIncomeHistoryQuery({ id, period });
  const student = studentQuery.data?.student;

  return (
    <section className="page-stack student-detail-screen">
      <div className="page-heading detail-heading">
        <div>
          <p className="eyebrow">Students / Detail View</p>
          <h2>{student?.fullName || "Student details"}</h2>
          <p className="page-subtitle">
            Senior academic records and financial standing for the current academic cycle.
          </p>
        </div>
        <div className="detail-actions">
          <Button as={Link} to={`/students/${id}/edit`} variant="secondary">
            <FiEdit2 aria-hidden="true" />
            Edit Profile
          </Button>
          <Button variant="primary">
            <FiDownload aria-hidden="true" />
            Generate Statement
          </Button>
        </div>
      </div>

      {studentQuery.isLoading ? <Loader /> : null}
      <Message variant="danger">
        {studentQuery.isError ? getErrorMessage(studentQuery.error) : ""}
      </Message>

      <div className="student-detail-grid">
        <aside className="student-bio-stack">
          <Card className="panel-card identity-card">
            <Card.Body>
              <div className="section-corner" aria-hidden="true" />
              <p className="summary-label">Academic Identity</p>
              <dl className="detail-list">
                <dt>Class</dt>
                <dd>{student?.className || "-"}</dd>
                <dt>Section</dt>
                <dd>{student?.section || "-"}</dd>
                <dt>Roll</dt>
                <dd>{student?.rollNumber || "-"}</dd>
                <dt>Phone</dt>
                <dd>{student?.phone || "-"}</dd>
                <dt>Mailing Address</dt>
                <dd>
                  <FiMapPin aria-hidden="true" />
                  {student?.address || "-"}
                </dd>
              </dl>
              <Badge bg={student?.isActive ? "success" : "secondary"}>
                {student?.isActive ? "Active" : "Inactive"}
              </Badge>
            </Card.Body>
          </Card>

          <section className="note-card">
            <p className="summary-label">Office Note</p>
            <p>{student?.note || "Consistently timely payments. Eligible for meal credit review."}</p>
          </section>
        </aside>

        <Card className="panel-card income-history-card">
          <Card.Body>
            <div className="section-title-row">
              <div>
                <h3>Income History</h3>
                <p>Record of all financial transactions for this student.</p>
              </div>
              <Form.Select
                className="period-select"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Income history period"
              >
                <option value="">All time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Form.Select>
            </div>
            {historyQuery.isFetching ? <Loader label="Loading history" /> : null}
            <StudentHistoryTable items={historyQuery.data?.incomeHistory || []} />
            <div className="history-total">
              <span>Total Lifetime Value</span>
              <strong>{formatCurrency(historyQuery.data?.totalIncome)}</strong>
            </div>
          </Card.Body>
        </Card>
      </div>

    </section>
  );
};

export default StudentDetailsPage;
