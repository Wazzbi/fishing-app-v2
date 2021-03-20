import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Auth";
import "./landingPage.scss";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const LandingPage = ({ history, location }) => {
  const { currentUser } = useContext(AuthContext);
  const lastLocation = localStorage.getItem("lastLocation");

  const redirect = () => {
    if (lastLocation && lastLocation !== "/") {
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
          <Spinner animation="border" variant="primary" />
        </div>
      );
    } else if (currentUser) {
      return (
        <div className="landing-page_main">
          <h3>Logged user - redirect</h3>
          <Spinner animation="border" variant="primary" />
        </div>
      );
    } else {
      return (
        <div className="landing-page_main">
          <h1>LandingPage</h1>
          <br />
          <br />
          <Button variant="primary" onClick={handleClick}>
            Sign In
          </Button>
        </div>
      );
    }
  };

  useEffect(() => {
    redirect();
  });

  return <Content />;
};

export default LandingPage;
