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
            <Link to={"/home"}>App</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link href="#link" onSelect={closeNav}>
                  <Link to={"/record"}>Record</Link>
                </Nav.Link>
                <Nav.Link href="#link" onSelect={closeNav}>
                  <Link to={"/summary"}>Summary</Link>
                </Nav.Link>
                <Nav.Link href="#link" onSelect={closeNav}>
                  <Link to={"/home"}>Home</Link>
                </Nav.Link>
                <Nav.Link href="#link" onSelect={closeNav}>
                  <Link to={"/user"}>User</Link>
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
