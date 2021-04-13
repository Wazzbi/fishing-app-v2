import React, { useEffect } from "react";
import firebaseService from "../../../../services/firebase/firebase.service";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

const Tools = ({ isMountedRef, storeState, dispatch }) => {
  const handleUnBlockUser = (firebaseId) => {
    firebaseService
      .deleteFromBlockedUser(firebaseId)
      .then(() => {
        return dispatch({
          type: "REMOVE_BLOCKED_USER",
          payload: firebaseId,
        });
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
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    handleUnBlockUser(value.firebaseId)
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
                Click me!
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
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
