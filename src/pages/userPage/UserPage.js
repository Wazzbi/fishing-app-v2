import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Auth";
import "./userPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import saveLastPathService from "../../services/utils/saveLastPath.service";

import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

// TODO change password z předešlé verze v gitu
// TODO GET data tady a né v Auth.js ...
// TODO barevné schéma ukládat do localStorage

const UserPage = ({ history }) => {
  const { currentUserData } = useContext(AuthContext);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [radioValue, setRadioValue] = useState("1");

  const handleCloseDeleteUser = () => setShowDeleteUser(false);
  const handleShowDeleteUser = () => setShowDeleteUser(true);

  const radios = [
    { name: "Světlé", value: "1" },
    { name: "Tmavé", value: "2" },
  ];

  const date = (d) => {
    return new Date(d).toISOString().substr(0, 10);
  };

  const deleteUser = () => {
    let user = firebaseService.auth().currentUser;

    user
      .delete()
      .then(function () {
        history.push("/");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    saveLastPathService.setWithExpiry("lastLocation", "/user");
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
          <div className="userPage-flex-row">
            <span className="userPage-row-title">Stav účtu:</span>
            <span className="userPage-row-value">
              {currentUserData && currentUserData.blockedUser ? (
                <span style={{ color: "red" }}>
                  Uživatel je zablokovaný. Nená oprávnění dělat příspěvky a
                  reportovat. Pro více informací kontaktujte podporu.
                </span>
              ) : (
                <span>Účet je v cajku ;-)</span>
              )}
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
          <h4>Nastavení účtu</h4>
          <div style={{ marginBottom: "20px" }}>
            <Button variant="secondary">Změnit jméno uživatele</Button>{" "}
            <Button variant="secondary" onClick={handleShowDeleteUser}>
              Zrušit účet
            </Button>
          </div>

          <br />
          <h4>Příspěvky</h4>
          <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
            <Tab eventKey="home" title="Vytvořené">
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
            </Tab>
            <Tab eventKey="profile" title="Uložené">
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
            </Tab>
            <Tab eventKey="contact" title="Nahlášené">
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
            </Tab>
          </Tabs>
        </div>
      </div>
      <Modal
        show={showDeleteUser}
        onHide={handleCloseDeleteUser}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Smazat účet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Opravdu chcete smazat svůj účet? Data budou nenávratně pryč.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteUser}>
            Zrušit
          </Button>
          <Button variant="outline-primary" onClick={deleteUser}>
            Ano, smazat
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserPage;
