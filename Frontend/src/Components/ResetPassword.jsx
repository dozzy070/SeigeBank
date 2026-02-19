import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../Utility/Api";

export default function ResetPassword() {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      setMessage({ text: "✅ Password reset successful!", type: "success" });
      setPassword("");

      setTimeout(() => navigate("/login"), 2000); // redirect to login
    } catch (err) {
      setMessage({
        text: "❌ Error: " + (err.response?.data?.error || err.message),
        type: "danger",
      });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "400px" }} className="p-4 shadow">
        <h2 className="text-center mb-4">Reset Password</h2>

        {message.text && <Alert variant={message.type}>{message.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Reset Password
          </Button>
        </Form>

        <p className="text-center mt-3">
          <Link to="/login" className="text-primary">
            Back to Login
          </Link>
        </p>
      </Card>
    </Container>
  );
}
