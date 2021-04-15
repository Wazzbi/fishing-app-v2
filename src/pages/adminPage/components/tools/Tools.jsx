import React, { useEffect } from "react";
import firebaseService from "../../../../services/firebase/firebase.service";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

// TODO opakovaný admin post -> udělat to nějak lépe

const Tools = ({
  isMountedRef,
  storeState,
  dispatch,
  currentUserData,
  getUser,
  searchUser,
  convertToDate,
}) => {
  const handleUnBlockUser = (firebaseId, user) => {
    firebaseService
      .setUserData(firebaseId, { ...user, blockedUser: false })
      .then(() => {
        return dispatch({
          type: "REMOVE_BLOCKED_USER",
          payload: firebaseId,
        });
      })
      .then(() => {
        const base_url = window.location.origin;

        const adminNote = {
          noteId: Date.now().toString(),
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
                <Card.Body>
                  <Form onSubmit={(e) => getUser(e)}>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formUserId">
                        <Form.Label>Uživatel (ID)</Form.Label>
                        <Form.Control type="number" name="userId" />
                      </Form.Group>
                      <Form.Group as={Col} controlId="formBasicCheckbox">
                        <Button
                          variant="success"
                          type="submit"
                          style={{
                            position: "absolute",
                            bottom: "0",
                          }}
                        >
                          Najít
                        </Button>
                      </Form.Group>
                    </Form.Row>
                  </Form>

                  {searchUser && (
                    <>
                      <hr />
                      <div style={{ display: "flex" }}>
                        <div style={{ flex: "1", paddingRight: "20px" }}>
                          <table>
                            <tbody>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  Uživatelské jméno:
                                </td>
                                <td>{searchUser.username}</td>
                              </tr>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  ID:
                                </td>
                                <td>{searchUser.id}</td>
                              </tr>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  Firebase ID:
                                </td>
                                <td>{searchUser.firebaseId}</td>
                              </tr>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  Email:
                                </td>
                                <td>{searchUser.email}</td>
                              </tr>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  Role:
                                </td>
                                <td>{searchUser.role}</td>
                              </tr>
                              <tr>
                                <td className="admin-page_search-user-key">
                                  Status uživatele:
                                </td>
                                <td>
                                  {searchUser.blockedUser ? (
                                    <span style={{ color: "red" }}>
                                      Zablokovaný
                                    </span>
                                  ) : (
                                    <span style={{ color: "#00cc00" }}>
                                      V pořádku
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <hr />
                          <div>
                            {/** TODO musí znovu provolat i načtení daného uživatele aby se změnil status, role... */}
                            <Button variant="success" size="sm">
                              Změnit roly
                            </Button>{" "}
                            <Button variant="danger" size="sm">
                              Zablokovat
                            </Button>{" "}
                            <Button variant="secondary" size="sm">
                              Poslat zprávu
                            </Button>
                          </div>
                        </div>
                        <div style={{ flex: "1" }}>
                          <Accordion>
                            <Card>
                              <Accordion.Toggle as={Card.Header} eventKey="0">
                                Reportoval (
                                {(searchUser &&
                                  searchUser.reportsCreated &&
                                  searchUser.reportsCreated.length) ||
                                  0}
                                )
                              </Accordion.Toggle>
                              <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                  <div
                                    style={{
                                      height: "150px",
                                      overflow: "auto",
                                    }}
                                  >
                                    {searchUser &&
                                      searchUser.reportsCreated &&
                                      searchUser.reportsCreated.map(
                                        (report) => (
                                          <div
                                            style={{
                                              marginBottom: "5px",
                                            }}
                                          >
                                            {convertToDate(
                                              report.reportCreated
                                            )}{" "}
                                            :{" "}
                                            <a
                                              href="#"
                                              style={{ color: "blue" }}
                                            >
                                              {report.reportedPost}
                                            </a>
                                          </div>
                                        )
                                      )}
                                  </div>
                                </Card.Body>
                              </Accordion.Collapse>
                            </Card>
                            <Card>
                              <Accordion.Toggle as={Card.Header} eventKey="1">
                                Příspěvky
                              </Accordion.Toggle>
                              <Accordion.Collapse eventKey="1">
                                <Card.Body>Hello! I'm another body</Card.Body>
                              </Accordion.Collapse>
                            </Card>
                          </Accordion>
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="2">
                Blokované příspěvky
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="2">
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
