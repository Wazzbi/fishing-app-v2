import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./homePage.scss";

import Button from "react-bootstrap/Button";

const HomePage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/home");
  }, []);

  return (
    <div className="home-page_main">
      <div className="home-page_main-sections">
        <Link to={"/record"} className="home-page_main-section-btn">
          <div className="home-page_main-section-btn-first">
            Evidence docházek a úlovků{" "}
          </div>
        </Link>

        <Link to={"/summary"} className="home-page_main-section-btn">
          <div className="home-page_main-section-btn-second">
            Sumář docházek a úlovků{" "}
          </div>
        </Link>

        <Link to={"/news"} className="home-page_main-section-btn">
          <div className="home-page_main-section-btn-third">
            Příspěvky rybářů
          </div>
        </Link>
      </div>

      <div className="home-page_title-container">
        <div>
          <p className="home-page_title">Vítejte na Rybce</p>
          <div className="home-page_title-text">
            <p style={{ margin: "0" }}>
              This is a simple hero unit, a simple jumbotron-style component for
              calling extra attention to featured content or information. This
              is a simple hero unit, a simple jumbotron-style component for
              calling extra attention.
            </p>

            <Button className="home-page_ghoust-btn home-page_title-btn">
              Číst více
            </Button>
          </div>

          <div className="home-page_wave">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path
                fill="#e6f1d7"
                d="M0,160L60,170.7C120,181,240,203,360,208C480,213,600,203,720,186.7C840,171,960,149,1080,149.3C1200,149,1320,171,1380,181.3L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="home-page_cards">
        <div className="home-page_card">
          <p className="home-page_card-title">
            Jak se stát partnerem této aplikace ?
          </p>

          <div className="home-page_card-text-wrapper">
            <p className="home-page_card-text">
              It uses utility classes for typography and spacing to space
              content out within the larger container.
            </p>
          </div>

          <Button className="home-page_ghoust-btn">Číst více</Button>
        </div>
        <div className="home-page_card">
          <p className="home-page_card-title">Aktuálně na českých rybnících</p>

          <div className="home-page_card-text-wrapper">
            <p className="home-page_card-text">
              12.9.2021 | It uses utility classes for typography and spacing to
              space content out within the larger container. It uses utility
              classes for typography and spacing to space content out within the
              larger container.
            </p>
          </div>

          <Button className="home-page_ghoust-btn">Číst více</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
