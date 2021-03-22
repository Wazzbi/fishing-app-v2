import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./homePage.scss";

import Card from "react-bootstrap/Card";

const HomePage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/home");
  }, []);

  return (
    <div className="home-page_main">
      <div className="home-page_main-sections">
        <Link to={"/record"} className="home-page_main-section">
          <div>Record</div>
        </Link>

        <Link to={"/summary"} className="home-page_main-section">
          <div>Summary</div>
        </Link>

        <Link to={"/news"} className="home-page_main-section">
          <div>News</div>
        </Link>
      </div>

      <div className="home-page_cards">
        <Card border="primary" style={{ marginTop: "10px" }}>
          <Card.Body>
            <Card.Title>Primary Card Title</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>

        <Card border="danger" style={{ marginTop: "10px" }}>
          <Card.Body>
            <Card.Title>Danger Card Title</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
