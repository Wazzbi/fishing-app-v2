import React, { useCallback, useState, useEffect } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import "./signUpPage.scss";
import { Link } from "react-router-dom";

import Toast from "react-bootstrap/Toast";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

//TODO toast jen jeden
// TODO styly zde a log in jsou stejné -> sloučit aby se nenačítali dvakrát

const SignUpPage = ({ history }) => {
  const [error, setError] = useState(null);

  const [showB, setShowB] = useState(false);
  const [show, setShow] = useState(false);

  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault();
      const { username, email, password } = event.target.elements;

      let checkUsersArray = [];

      firebaseService
        .checkUserExists(username.value)
        .once("value", (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            checkUsersArray.push(childSnapshot.key);
          });
        })
        .then(() => {
          if (!checkUsersArray.length) {
            const role = "user";
            const id = Date.now();
            try {
              // create account
              firebaseService
                .auth()
                .createUserWithEmailAndPassword(email.value, password.value)
                .then((authUser) => {
                  // create user in db
                  firebaseService.firebaseUser(authUser.user.uid).set({
                    username: username.value,
                    email: email.value,
                    role,
                    id,
                  });
                  history.push("/");
                });
            } catch (error) {
              setError(error);
              setShowB(true);
            }
          } else {
            setShow(true);
            checkUsersArray = [];
          }
        });
    },
    [history]
  );

  useEffect(() => {
    localStorage.setItem("lastLocation", "/signup");
  }, []);

  return (
    <div className="sign-up_main">
      <div className="sign-up_form">
        <h1 className="sign-up_title">Sign up</h1>

        <Form onSubmit={handleSignUp}>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              name="username"
              required
            />
          </Form.Group>

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
              minLength="8"
              name="password"
              required
            />
            <Form.Text className="text-muted">Atleast 8 characters</Form.Text>
          </Form.Group>

          <div className="sign-up_btn-group">
            <Button variant="outline-primary" as={Link} to={"/"}>
              Back
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
      <div className="sign-up_notification">
        {error && (
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
              <Toast.Body>Tento email je již zabraný</Toast.Body>
            </Toast>
          </Col>
        )}

        <Col style={{ width: "100%" }}>
          <Toast
            style={{ backgroundColor: "lightpink" }}
            onClose={() => setShow(false)}
            show={show}
            delay={5000}
            autohide
          >
            <Toast.Header>
              <strong className="mr-auto">Upozornění</strong>
            </Toast.Header>
            <Toast.Body>Uživatelské jméno je zabrané</Toast.Body>
          </Toast>
        </Col>
      </div>
    </div>
  );
};

export default SignUpPage;
