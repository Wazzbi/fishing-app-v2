import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./homePage.scss";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

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
        <Card style={{ marginTop: "10px" }}>
          <Card.Header>
            <Button
              variant="info"
              size="sm"
              className="record-page_row-btn"
              style={{ pointerEvents: "none" }}
            >
              <img
                src="/exclamation.svg"
                alt="exclamation"
                width="15px"
                height="15px"
              ></img>
            </Button>{" "}
            <span className="text-muted">12.12.2021</span>
          </Card.Header>
          <Card.Body>
            <Card.Title>Aktualizace záložky Počasí</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>

        <Card style={{ marginTop: "10px" }}>
          <Card.Header>
            <Button
              variant="danger"
              size="sm"
              className="record-page_row-btn"
              style={{ pointerEvents: "none" }}
            >
              <img
                src="/exclamation.svg"
                alt="exclamation"
                width="15px"
                height="15px"
              ></img>
            </Button>{" "}
            <span className="text-muted">23.10.2021</span>
          </Card.Header>
          <Card.Body>
            <Card.Title>Změna v pravidlech rybaření na Lipnu</Card.Title>
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
