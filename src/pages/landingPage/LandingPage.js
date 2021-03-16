import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Auth";
import "./landingPage.scss";

import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

//TODO na místo "Logged user - redirect" dát ještě nějakou animačku nebo nějaký obrázek přidat

const LandingPage = ({ history }) => {
  const { currentUser } = useContext(AuthContext);

  const redirect = () => {
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
    if (currentUser) {
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
