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

  let showNavbar = true;
  window.onscroll = function (e) {
    // print "false" if direction is down and "true" if up
    showNavbar = this.oldScroll > this.scrollY;
    this.oldScroll = this.scrollY;

    const navbar = document.getElementById("navbar");
    if (showNavbar) {
      navbar.classList.remove("hidden");
    } else {
      navbar.classList.add("hidden");
    }
  };

  const AppNavbar = () => {
    if (currentUser) {
      return (
        <>
          <Navbar
            expand="lg"
            variant="dark"
            className="navigation_nav show"
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
                  Účet
                </Nav.Link>
                <Nav.Link as={Link} to={"/about"}>
                  O aplikaci
                </Nav.Link>
              </Nav>

              <Button className="navigation_btn" onClick={signOut}>
                Odhlásit
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
