import React, { useCallback, useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../../Auth.js";
import firebaseService from "../../services/firebase/firebase.service";
import { Link } from "react-router-dom";
import "./loginPage.scss";

import Toast from "react-bootstrap/Toast";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const LoginPage = ({ history }) => {
  const [showB, setShowB] = useState(false);

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await firebaseService
          .auth()
          .signInWithEmailAndPassword(email.value, password.value);
        history.push("/home");
      } catch (error) {
        setShowB(true);
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/home" />;
  }

  return (
    <div className="login-page_main">
      <div className="login-page_form">
        <h1 className="login-page_title">Log in</h1>

        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              name="email"
              required
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              minlength="8"
              name="password"
              required
            />
          </Form.Group>

          <div className="login-page_btn-group">
            <Button variant="outline-primary" as={Link} to={"/"}>
              Back
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
      <br />
      <Link to={"/signUp"}>Create new account</Link>

      <div className="login-page_notification">
        <Col style={{ width: "100%" }}>
          <Toast
            style={{ backgroundColor: "lightpink" }}
            onClose={() => setShowB(false)}
            show={showB}
            delay={5000}
            autohide
          >
            <Toast.Header>
              <strong className="mr-auto">Upozornění</strong>
            </Toast.Header>
            <Toast.Body>Špatný email nebo heslo</Toast.Body>
          </Toast>
        </Col>
      </div>
    </div>
  );
};

export default LoginPage;
