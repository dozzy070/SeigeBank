import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import api from "../Utility/Api.jsx";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      setMessage({
        text: "✅ If the email exists, a reset link has been sent!",
        type: "success",
      });
      setEmail("");
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
        <h2 className="text-center mb-4">Forgot Password</h2>

        {message.text && <Alert variant={message.type}>{message.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Send Reset Link
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
