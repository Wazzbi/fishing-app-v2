import React, { useContext } from "react";
import { AuthContext } from "../Auth";
import firebaseService from "../services/firebase/firebase.service";
import { Link, withRouter } from "react-router-dom";

import "./navigation.scss";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

const Navigation = () => {
  const { currentUser, currentUserData } = useContext(AuthContext);

  const signOut = () => firebaseService.auth().signOut();

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <div style={{ position: "relative" }}>
          <Navbar
            expand="lg"
            variant="dark"
            className="navigation_nav"
            id="navbar"
            collapseOnSelect
            fixed="top"
          >
            <Navbar.Brand as={Link} to={"/home"}>
              <b>Rybka</b>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to={"/home"}>
                  Domů
                </Nav.Link>
                <Nav.Link as={Link} to={"/news"}>
                  Příspěvky
                </Nav.Link>
                <Nav.Link as={Link} to={"/record"}>
                  Záznamy
                </Nav.Link>
                <Nav.Link as={Link} to={"/summary"}>
                  Souhrny
                </Nav.Link>
                <Nav.Link as={Link} to={"/weather"}>
                  Počasí
                </Nav.Link>
                <Nav.Link as={Link} to={"/user"}>
                  <span
                    className={
                      currentUserData && currentUserData.blockedUser
                        ? "navigation_notofication-dot-account"
                        : ""
                    }
                  >
                    Účet
                  </span>
                </Nav.Link>
                <Nav.Link as={Link} to={"/about"}>
                  O aplikaci
                </Nav.Link>
                {currentUserData && currentUserData.role === "admin" ? (
                  <Nav.Link as={Link} to={"/admin"}>
                    Admin
                  </Nav.Link>
                ) : (
                  ""
                )}
              </Nav>

              <Button className="navigation_btn" onClick={signOut}>
                Odhlásit
              </Button>
            </Navbar.Collapse>
          </Navbar>
          <div
            className={
              currentUserData && currentUserData.blockedUser
                ? "navigation_notofication-dot"
                : ""
            }
          ></div>
        </div>
      );
    }

    return null;
  };
  return <AppNavbar />;
};

export default withRouter(Navigation);
