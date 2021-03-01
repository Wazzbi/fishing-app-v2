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
  const [navExpanded, setNavExpanded] = useState(false);

  const closeNav = () => {
    setNavExpanded(false);
  };

  // TODO vyřešit chybové hlášky - zanořené <a></a>

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <>
          <Navbar
            bg="light"
            expand="lg"
            className="cx-nav"
            onToggle={(state) => setNavExpanded(state)}
            expanded={navExpanded}
          >
            <Navbar.Brand as={Link} to={"/home"}>
              React-Bootstrap
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to={"/weather"} onSelect={closeNav}>
                  Weather
                </Nav.Link>
                <Nav.Link as={Link} to={"/news"} onSelect={closeNav}>
                  News
                </Nav.Link>
                <Nav.Link as={Link} to={"/record"} onSelect={closeNav}>
                  Record
                </Nav.Link>
                <Nav.Link as={Link} to={"/summary"} onSelect={closeNav}>
                  Summary
                </Nav.Link>
                <Nav.Link as={Link} to={"/home"} onSelect={closeNav}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to={"/user"} onSelect={closeNav}>
                  User
                </Nav.Link>
              </Nav>

              <Button
                variant="outline-success"
                onClick={() => firebaseService.auth().signOut()}
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