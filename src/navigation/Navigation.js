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

  // TODO místo user -> zobrazit jméno zkráceně

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <>
          <Navbar
            expand="lg"
            variant="dark"
            className="navigation_nav"
            onToggle={(state) => setNavExpanded(state)}
            expanded={navExpanded}
          >
            <Navbar.Brand as={Link} to={"/home"}>
              React-Bootstrap
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to={"/home"} onClick={closeNav}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to={"/news"} onClick={closeNav}>
                  News
                </Nav.Link>
                <Nav.Link as={Link} to={"/record"} onClick={closeNav}>
                  Record
                </Nav.Link>
                <Nav.Link as={Link} to={"/summary"} onClick={closeNav}>
                  Summary
                </Nav.Link>
                <Nav.Link as={Link} to={"/weather"} onClick={closeNav}>
                  Weather
                </Nav.Link>
                <Nav.Link as={Link} to={"/user"} onClick={closeNav}>
                  User
                </Nav.Link>
                <Nav.Link as={Link} to={"/settings"} onClick={closeNav}>
                  Settings
                </Nav.Link>
              </Nav>

              <Button
                variant="outline-light"
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
