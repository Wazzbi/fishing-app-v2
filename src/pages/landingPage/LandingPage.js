import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Auth";
import "./landingPage.scss";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const LandingPage = ({ history, location }) => {
  const { currentUser } = useContext(AuthContext);
  const lastLocation = localStorage.getItem("lastLocation");

  const redirect = () => {
    if (lastLocation && lastLocation !== "/" && lastLocation !== "/signup") {
      return history.push(lastLocation);
    }

    if (currentUser) {
      setTimeout(() => {
        history.push("/home");
      }, 2000);
    }
  };

  const handleClick = () => {
    history.push("/login");
  };

  const Content = () => {
    if (lastLocation && lastLocation !== "/") {
      return (
        <div className="landing-page_main">
          <h3>Loading...</h3>
          <Spinner animation="border" variant="success" />
        </div>
      );
    } else if (currentUser) {
      return (
        <div className="landing-page_main">
          <h3>Logged user - redirect</h3>
          <Spinner animation="border" variant="success" />
        </div>
      );
    } else {
      return (
        <div className="landing-page_main">
          <div className="landing-page_main-container">
            <h3>Výtejte na rybářské aplikaci</h3>
            <h1>
              <b>Rybka</b>
            </h1>
            <br />
            <Button variant="success" onClick={handleClick}>
              Přihlásit
            </Button>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    localStorage.setItem("lastLocation", "/");
    redirect();
  }, []);

  return <Content />;
};

export default LandingPage;
