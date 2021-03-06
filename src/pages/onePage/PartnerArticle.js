import React, { useEffect } from "react";
import "./onePage.scss";
import { Link } from "react-router-dom";
import saveLastPathService from "../../services/utils/saveLastPath.service";

import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO like btn + komentaře
// TODO pořdná animace než se načtou obr a pak modal
// TODO effect cleanUp

const PartnerArticle = () => {
  useEffect(() => {
    saveLastPathService.setWithExpiry("lastLocation", "/partnerArticle");
    // nasty react...
    // https://stackoverflow.com/questions/58431946/why-does-my-react-router-link-bring-me-to-the-middle-of-a-page
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="onePage-page_main">
        <div className="onePage-page-post">
          <Button
            variant="outline-dark"
            as={Link}
            to={"/home"}
            className="onePage-page_back-btn-icon"
            title="Back"
          ></Button>

          <div>
            <p className="onePage-page_title">
              <strong>Pomocte Rybce růst</strong>
            </p>
            <p>
              <small style={{ color: "#808080", fontFamily: "poppins" }}>
                David Novotný {" | "} 31.3.2021 15:38
              </small>
            </p>
            <p className="onePage-page_icons-group">
              <Badge variant="dark">Info</Badge>
            </p>

            <div className="onePage-page_text">
              <p>
                <a href="https://www.patreon.com/rybka">Rybka - Patreon</a>
              </p>
              <p>
                <a href="https://www.buymeacoffee.com/rybka">
                  Rybka - Buymeacoffee
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerArticle;
