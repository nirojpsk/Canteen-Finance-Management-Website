import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiAtSign, FiLock, FiShield } from "react-icons/fi";
import Message from "../../components/common/Message";
import { useLoginAdminMutation } from "../../features/auth/authApiSlice";
import getErrorMessage from "../../utils/getErrorMessage";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminInfo } = useSelector((state) => state.auth);
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (adminInfo) {
      navigate(redirectTo, { replace: true });
    }
  }, [adminInfo, navigate, redirectTo]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      await loginAdmin(formData).unwrap();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login failed"));
    }
  };

  return (
    <main className="auth-screen">
      <Card className="auth-card shadow-sm">
        <Card.Body>
          <div className="auth-brand">
            <span className="auth-brand-mark">
              <img src="/schoollogo.png" alt="School logo" className="auth-brand-logo-image" />
            </span>
            <h1>Canteen Finance</h1>
          </div>
          <Message variant="danger">{errorMessage}</Message>
          <Form className="auth-form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <div className="input-with-icon">
                <Form.Control
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@canteen.finance"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <FiAtSign aria-hidden="true" />
              </div>
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <div className="form-label-row">
                <Form.Label>Password</Form.Label>
              </div>
              <div className="input-with-icon">
                <Form.Control
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FiLock aria-hidden="true" />
              </div>
            </Form.Group>
<Button type="submit" className="w-100" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </main>
  );
};

export default LoginPage;
