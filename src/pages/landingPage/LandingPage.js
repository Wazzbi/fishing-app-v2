import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Auth";

import Button from "react-bootstrap/Button";

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
        <>
          <h1>Logged user - redirect</h1>
        </>
      );
    } else {
      return (
        <>
          <h1>LandingPage</h1>
          <Button variant="primary" onClick={handleClick}>
            Sign In
          </Button>
        </>
      );
    }
  };

  useEffect(() => {
    redirect();
  });

  return <Content />;
};

export default LandingPage;
