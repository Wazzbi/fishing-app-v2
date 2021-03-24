import React, { useContext, useState } from "react";
import { AuthContext } from "../Auth";
import firebaseService from "../services/firebase/firebase.service";
import { Link, withRouter } from "react-router-dom";

import "./navigation.scss";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const Navigation = () => {
  const { currentUser } = useContext(AuthContext);

  const signOut = () => firebaseService.auth().signOut();

  // TODO místo user -> zobrazit jméno zkráceně

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <>
          <Navbar
            expand="lg"
            variant="dark"
            className="navigation_nav"
            collapseOnSelect
          >
            <Navbar.Brand as={Link} to={"/home"}>
              Fish-App
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to={"/home"}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to={"/news"}>
                  News
                </Nav.Link>
                <Nav.Link as={Link} to={"/record"}>
                  Record
                </Nav.Link>
                <Nav.Link as={Link} to={"/summary"}>
                  Summary
                </Nav.Link>
                <Nav.Link as={Link} to={"/weather"}>
                  Weather
                </Nav.Link>
                <Nav.Link as={Link} to={"/user"}>
                  User
                </Nav.Link>
                <Nav.Link as={Link} to={"/settings"}>
                  Settings
                </Nav.Link>
              </Nav>

              <Button variant="outline-light" onClick={signOut}>
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
