import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const emptyForm = {
  fullName: "",
  className: "",
  section: "",
  rollNumber: "",
  phone: "",
  address: "",
  note: "",
};

const normalizeStudentForm = (student = emptyForm) => ({
  fullName: student.fullName || "",
  className: student.className || "",
  section: student.section || "",
  rollNumber: student.rollNumber || "",
  phone: student.phone || "",
  address: student.address || "",
  note: student.note || "",
});

const StudentForm = ({
  initialData = emptyForm,
  isLoading = false,
  submitLabel = "Save student",
  onSubmit,
}) => {
  const [formData, setFormData] = useState(() => normalizeStudentForm(initialData));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form className="student-form" onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="fullName">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              name="fullName"
              placeholder="e.g. Julian Montgomery"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="className">
            <Form.Label>Class</Form.Label>
            <Form.Control
              name="className"
              placeholder="Senior I"
              value={formData.className}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="section">
            <Form.Label>Section</Form.Label>
            <Form.Control
              name="section"
              placeholder="A-1"
              value={formData.section}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="rollNumber">
            <Form.Label>Roll number</Form.Label>
            <Form.Control
              name="rollNumber"
              placeholder="2024-001"
              value={formData.rollNumber}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              placeholder="Primary residence address..."
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="note">
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="note"
              placeholder="Confidential student notes..."
              value={formData.note}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default StudentForm;
