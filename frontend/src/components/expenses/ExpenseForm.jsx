import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const categories = [
  "stock",
  "drinks",
  "gas",
  "salary",
  "rent",
  "electricity",
  "miscellaneous",
];

const ExpenseForm = ({ isLoading = false, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "stock",
    expenseDate: "",
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
      expenseDate: formData.expenseDate || undefined,
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
    <Form className="expense-form finance-form" onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="expenseTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              name="title"
              placeholder="e.g. Bulk rice supply"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="expenseAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              name="amount"
              type="number"
              min="1"
              placeholder="Rs. 0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category[0].toUpperCase() + category.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="expenseDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              name="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="expenseNote">
            <Form.Label>Add note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
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
          {isLoading ? "Saving..." : "Record Expense"}
        </Button>
      </div>
    </Form>
  );
};

export default ExpenseForm;
