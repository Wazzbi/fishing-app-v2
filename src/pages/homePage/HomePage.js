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
            <Card.Title>Aktualizace záložky Počasí</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              12.12.2021
            </Card.Subtitle>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>

        <Card border="danger" style={{ marginTop: "10px" }}>
          <Card.Body>
            <Card.Title>Změna v pravidlech rybaření na Lipnu</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              10.11.2021
            </Card.Subtitle>
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
