import React, { useEffect } from "react";
import firebaseService from "../../../../services/firebase/firebase.service";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

// TODO opakovaný admin post -> udělat to nějak lépe

const Tools = ({ isMountedRef, storeState, dispatch, currentUserData }) => {
  const handleUnBlockUser = (firebaseId, user) => {
    firebaseService
      .deleteFromBlockedUser(firebaseId)
      .then(() => {
        return dispatch({
          type: "REMOVE_BLOCKED_USER",
          payload: firebaseId,
        });
      })
      .then(() => {
        const base_url = window.location.origin;

        const adminNote = {
          noteId: Date.now(),
          case: "User UNBLOCKED",
          detail: {
            username: user.username,
            userId: user.id,
            postUrl: user.postUrl,
            solverId: currentUserData.id,
            solverName: currentUserData.username,
          },
        };

        firebaseService
          .createAdminNote(adminNote)
          .then(() => {
            dispatch({
              type: "ADD_ADMIN_NOTE",
              payload: adminNote,
            });
          })
          .catch((err) => console.error);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    if (!storeState.blockedUsers) {
      firebaseService.getBlockedUsers().then((blockedUsers) => {
        return dispatch({
          type: "ADD_BLOCKED_USERS",
          payload: blockedUsers,
        });
      });
    }
  }, []);

  return (
    <>
      <div className="admin-page-section">
        <div>
          <p className="admin-page_title">
            <strong>Admin nástroje</strong>
          </p>

          <Accordion>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="0">
                Zablokovaný uživatelé (
                {(storeState &&
                  storeState.blockedUsers &&
                  Object.keys(storeState.blockedUsers).length) ||
                  0}
                )
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Uživatelské jméno</th>
                        <th>Email</th>
                        <th>Odkaz na příspěvek</th>
                        <th>Akce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState &&
                        storeState.blockedUsers &&
                        Object.entries(storeState.blockedUsers).map(
                          ([key, value]) => (
                            <tr>
                              <td>{value.id}</td>
                              <td>{value.username}</td>
                              <td>{value.email}</td>
                              <td>
                                <a
                                  href={value.postUrl}
                                  style={{ color: "blue" }}
                                  target="_blank"
                                >
                                  odkaz
                                </a>
                              </td>
                              <td>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    handleUnBlockUser(value.firebaseId, value)
                                  }
                                >
                                  Odblokovat
                                </Button>
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="1">
                Najít uživatele
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>Hello! I'm another body</Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="2">
                Změnit roly uživatele
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="2">
                <Card.Body>Hello! I'm another body</Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="3">
                Blokované příspěvky
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="3">
                <Card.Body>Hello! I'm another body</Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default Tools;
