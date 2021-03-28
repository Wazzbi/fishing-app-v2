import React from "react";
import firebaseService from "../../services/firebase/firebase.service";
import "./forgotPasswordPage.scss";
import { Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

// console.log("Password reset email sent")
// history.replaceState({}, null, "http://localhost:3000/#/login")

const ForgotPasswordPage = ({ history }) => {
  const resetPassword = (event) => {
    const { emailReset } = event.target.elements;
    firebaseService
      .auth()
      .sendPasswordResetEmail(emailReset.value)
      .then(() => console.log("Password reset email sent"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="forgotPassword-page_main">
      <div className="forgotPassword-page_form">
        <Form onSubmit={resetPassword}>
          <Form.Group controlId="emailReset">
            <Form.Label className="forgotPassword-page_label">
              Napište svůj přihlašovací email na který Vám doručíne pokyny k
              resetování hesla
            </Form.Label>
            <br />
            <br />
            <Form.Control
              type="email"
              placeholder="Email"
              name="emailReset"
              required
            />
          </Form.Group>

          <div className="forgotPassword-page_btn-group">
            <Button variant="outline-secondary" as={Link} to={"/"}>
              Back
            </Button>
            <Button variant="success" type="submit">
              Reset Password
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
