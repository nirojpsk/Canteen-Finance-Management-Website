import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArchive, FiArrowLeft, FiCamera } from "react-icons/fi";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Loader from "../../components/common/Loader";
import Message from "../../components/common/Message";
import StudentForm from "../../components/students/StudentForm";
import {
  useGetStudentByIdQuery,
  useToggleStudentStatusMutation,
  useUpdateStudentMutation,
} from "../../features/students/studentApiSlice";
import getErrorMessage from "../../utils/getErrorMessage";
import { formatCurrency } from "../../utils/formatCurrency";
import { useState } from "react";

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const studentQuery = useGetStudentByIdQuery(id);
  const [updateStudent, updateState] = useUpdateStudentMutation();
  const [toggleStudentStatus, toggleState] = useToggleStudentStatusMutation();
  const student = studentQuery.data?.student;

  const handleUpdate = async (data) => {
    setErrorMessage("");
    try {
      await updateStudent({ id, ...data }).unwrap();
      navigate(`/students/${id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to update student"));
    }
  };

  const handleArchive = async () => {
    setErrorMessage("");
    try {
      await toggleStudentStatus(id).unwrap();
      setShowArchiveConfirm(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to archive student"));
    }
  };

  return (
    <section className="page-stack edit-student-screen">
      <div className="edit-topbar">
        <Button as={Link} to={`/students/${id}`} variant="link">
          <FiArrowLeft aria-hidden="true" />
          Cancel
        </Button>
        <div>
          <p>ID: {student?.rollNumber || id}</p>
        </div>
      </div>

      {studentQuery.isLoading ? <Loader /> : null}
      <Message variant="danger">
        {errorMessage || (studentQuery.isError ? getErrorMessage(studentQuery.error) : "")}
      </Message>

      <div className="edit-student-grid">
        <aside className="edit-profile-stack">
          <Card className="panel-card edit-profile-card">
            <Card.Body>
              <div className="student-photo">
                {student?.profilePicture ? <img src={student.profilePicture} alt="" /> : null}
                <button type="button" aria-label="Update student photo">
                  <FiCamera aria-hidden="true" />
                </button>
              </div>
              <h2>{student?.fullName || "Student"}</h2>
              <p>
                {student?.className || "-"} {student?.section ? `- Section ${student.section}` : ""}
                {student?.rollNumber ? ` - Roll ${student.rollNumber}` : ""}
              </p>
              <div className="profile-balance-row">
                <span>
                  <small>Balance</small>
                  <strong>{formatCurrency(student?.balance || 0)}</strong>
                </span>
                <span>
                  <small>Attendance</small>
                  <strong>94%</strong>
                </span>
              </div>
            </Card.Body>
          </Card>

          <section className="quick-stats-card">
            <p className="summary-label">Quick Stats</p>
            <dl>
              <dt>Last Transaction</dt>
              <dd>Current Period</dd>
              <dt>Meal Preference</dt>
              <dd>Standard</dd>
              <dt>Joined Date</dt>
              <dd>Active Record</dd>
            </dl>
          </section>
        </aside>

        <Card className="panel-card edit-form-card">
          <Card.Body>
            <p className="eyebrow">Core Identification</p>
            {student ? (
              <StudentForm
                key={student._id}
                initialData={student}
                onSubmit={handleUpdate}
                isLoading={updateState.isLoading}
                submitLabel="Save Changes"
              />
            ) : null}
            <div className="archive-row">
              <div>
                <h3>Archive Record</h3>
                <p>Archiving removes this student from active reports but retains history.</p>
              </div>
              <Button
                type="button"
                variant="outline-danger"
                onClick={() => setShowArchiveConfirm(true)}
                disabled={toggleState.isLoading}
              >
                <FiArchive aria-hidden="true" />
                {toggleState.isLoading ? "Saving..." : "Archive Student"}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      <ConfirmationModal
        show={showArchiveConfirm}
        title="Archive student"
        message="Are u sure, u want to delete?"
        confirmLabel="Archive"
        isLoading={toggleState.isLoading}
        onCancel={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
      />
    </section>
  );
};

export default EditStudentPage;
