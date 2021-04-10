import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Auth";
import "./userPage.scss";

import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

// TODO change password z předešlé verze v gitu
// TODO GET data tady a né v Auth.js ...
// TODO barevné schéma ukládat do localStorage

const UserPage = () => {
  const { currentUserData } = useContext(AuthContext);
  const [radioValue, setRadioValue] = useState("1");

  const radios = [
    { name: "Světlé", value: "1" },
    { name: "Tmavé", value: "2" },
  ];

  const date = (d) => {
    return new Date(d).toISOString().substr(0, 10);
  };

  useEffect(() => {
    localStorage.setItem("lastLocation", "/user");
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="userPage-main">
        <div className="userPage-container">
          <h4>Obecné</h4>
          <div className="userPage-flex-row">
            <span className="userPage-row-title">Uživatelské jméno:</span>
            <span className="userPage-row-value">
              {currentUserData && currentUserData.username}
            </span>
          </div>
          <div className="userPage-flex-row">
            <span className="userPage-row-title">Přihlašovací email:</span>
            <span className="userPage-row-value">
              {currentUserData && currentUserData.email}
            </span>
          </div>
          <div className="userPage-flex-row">
            <span className="userPage-row-title">Uživatelská role:</span>
            <span className="userPage-row-value">
              {currentUserData && currentUserData.role}
            </span>
          </div>

          <br />
          <h4>Nastavení</h4>
          <div className="userPage-flex-row">
            <span className="userPage-row-title">Barevné schéma:</span>
            <span className="userPage-row-value">
              <ButtonGroup toggle>
                {radios.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    type="radio"
                    variant="outline-secondary"
                    size="sm"
                    name="radio"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => setRadioValue(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </span>
          </div>

          <br />
          <h4>Nahlášené příspěvky</h4>

          {currentUserData &&
            currentUserData.reportsCreated &&
            currentUserData.reportsCreated.map((report, index) => (
              <div key={`report-${index}`} className="userPage-flex-row">
                <span className="userPage-row-title">
                  {`${date(report.reportCreated)}:`}
                </span>
                <span className="userPage-row-value">
                  {report.reportedPost}
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default UserPage;
