import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./homePage.scss";

import Button from "react-bootstrap/Button";

const HomePage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/home");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page_main">
      <div className="home-page_main-body">
        <div className="home-page_main-sections">
          <Link to={"/record"} className="home-page_main-section-btn">
            <div className="home-page_main-section-btn-first">
              Záznamy docházek a úlovků
            </div>
          </Link>

          <Link to={"/summary"} className="home-page_main-section-btn">
            <div className="home-page_main-section-btn-second">
              Souhrn docházek a úlovků
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
            <div className="home-page_title-text-area">
              <p className="home-page_title-text">
                Toto je rybářská aplikace RYBKA. Vytvořte si svoje záznamy a
                souhrny o úlovcích či se podívejte co je nového v rybaření u nás
                i ve světě. Více informací o možnostech a pravidlech na RYBCE
                kliknite na číst více.
              </p>

              <Button
                className="home-page_ghoust-btn home-page_title-btn"
                as={Link}
                to={"/titleArticle"}
              >
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

            <div className="home-page_card-text-btn-wrapper">
              <Button
                className="home-page_ghoust-btn"
                as={Link}
                to={"/partnerArticle"}
              >
                Číst více
              </Button>
            </div>
          </div>
          <div className="home-page_card">
            <p className="home-page_card-title">
              Aktuálně na českých rybnících
            </p>

            <div className="home-page_card-text-wrapper">
              <p className="home-page_card-text">
                12.9.2021 | It uses utility classes for typography and spacing
                to space content out within the larger container. It uses
                utility classes for typography and spacing to space content out
                within the larger container.
              </p>
            </div>

            <div className="home-page_card-text-btn-wrapper">
              <Button
                className="home-page_ghoust-btn"
                as={Link}
                to={"/actualArticle"}
              >
                Číst více
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
