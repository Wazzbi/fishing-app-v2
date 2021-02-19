import React, { useContext } from "react";
import { AuthContext } from "../../Auth";
import app from "../../base";
import { Link, withRouter } from "react-router-dom";

import "./navigation.scss";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const Navigation = () => {
  const { currentUser } = useContext(AuthContext);

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <>
          <Navbar bg="light" expand="lg" className="cx-nav">
            <Link to={"/home"}>App</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Link to={"/record"} className="cx-link">
                  Record
                </Link>
                <Link to={"/summary"} className="cx-link">
                  Summary
                </Link>
                <Link to={"/home"} className="cx-link">
                  Home
                </Link>
              </Nav>

              <Button
                variant="outline-success"
                onClick={() => app.auth().signOut()}
              >
                Sign out
              </Button>
            </Navbar.Collapse>
          </Navbar>
        </>
      );
    }

    return null;
  };
  return <AppNavbar />;
};

export default withRouter(Navigation);
