import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const paymentMethods = ["cash", "esewa", "khalti", "bank", "other"];

const IncomeForm = ({ students = [], isLoading = false, onSubmit }) => {
  const [formData, setFormData] = useState({
    student: "",
    title: "",
    amount: "",
    paymentMethod: "cash",
    incomeDate: "",
    note: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isSaved = await onSubmit({
      ...formData,
      amount: Number(formData.amount),
      incomeDate: formData.incomeDate || undefined,
    });
    if (isSaved) {
      setFormData((current) => ({
        ...current,
        title: "",
        amount: "",
        note: "",
      }));
    }
  };

  return (
    <Form className="income-form finance-form" onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="student">
            <Form.Label>Student</Form.Label>
            <Form.Select
              name="student"
              value={formData.student}
              onChange={handleChange}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} ({student.className})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="title">
            <Form.Label>Title / Description</Form.Label>
            <Form.Control
              name="title"
              placeholder="e.g. Monthly mess fees"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              name="amount"
              type="number"
              min="1"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="paymentMethod">
            <Form.Label>Method</Form.Label>
            <Form.Select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method[0].toUpperCase() + method.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="incomeDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              name="incomeDate"
              type="date"
              placeholder="mm/dd/yyyy"
              value={formData.incomeDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={9}>
          <Form.Group controlId="incomeNote">
            <Form.Label>Note (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="note"
              placeholder="Additional details..."
              value={formData.note}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="mt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Confirm Income Entry"}
        </Button>
      </div>
    </Form>
  );
};

export default IncomeForm;
