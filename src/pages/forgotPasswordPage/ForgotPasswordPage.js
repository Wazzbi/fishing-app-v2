import React, { useState } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import "./forgotPasswordPage.scss";
import { Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

// console.log("Password reset email sent")
// history.replaceState({}, null, "http://localhost:3000/#/login")

const ForgotPasswordPage = () => {
  const [resetDone, setResetDone] = useState(false);

  const resetPassword = (event) => {
    event.preventDefault();
    const { emailReset } = event.target.elements;
    firebaseService
      .auth()
      .sendPasswordResetEmail(emailReset.value)
      .then(() => {
        console.log("Password reset email sent");
        return setResetDone(true);
      })
      .catch((err) => console.error(err));
  };

  return resetDone ? (
    <div className="forgotPassword-page_main">
      <div className="forgotPassword-page_form">
        <p>
          Vaše heslo bylo resetováno. Následujte instrukce ktéré jste obdržel na
          email a poté se přihlašte novým heslem.
        </p>

        <Button variant="outline-secondary" as={Link} to={"/"}>
          Back
        </Button>
      </div>
    </div>
  ) : (
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
