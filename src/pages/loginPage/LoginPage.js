import React, { useCallback, useContext, useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../../Auth.js";
import firebaseService from "../../services/firebase/firebase.service";
import saveLastPathService from "../../services/utils/saveLastPath.service";
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

  const goToLandingPage = () => {
    saveLastPathService.setWithExpiry("lastLocation", "/");
    history.push("/");
  };

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    saveLastPathService.setWithExpiry("lastLocation", "/login");
  }, []);

  return currentUser ? (
    <Redirect to="/home" />
  ) : (
    <div className="login-page_main">
      <div className="login-page_main-container">
        <div className="login-page_form">
          <h1 className="login-page_title">Přihlášení</h1>

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
              <Form.Label>Heslo</Form.Label>
              <Form.Control
                type="password"
                placeholder="Heslo"
                minLength="8"
                name="password"
                required
              />
            </Form.Group>

            <div className="login-page_btn-group">
              <Button variant="outline-secondary" onClick={goToLandingPage}>
                Zpět
              </Button>
              <Button variant="success" type="submit">
                Potvrdit
              </Button>
            </div>
          </Form>
        </div>
        <br />
        <Link to={"/signUp"}>Vytvořit nový účet</Link>
        <br />
        <Link to={"/forgotPassword"}>Reset hesla</Link>
      </div>

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
