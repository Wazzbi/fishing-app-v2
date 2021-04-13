import React from "react";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

const ReportedPostsAccordion = ({ storeState, deletePost, banUser }) => {
  function onlyUniqueCategories(report, index, self) {
    return self.indexOf(report) === index;
  }

  const convertToDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0">
          Reportované příspěvky{" "}
          <Badge variant="danger">
            {Object.keys(storeState.reportedPosts).length}
          </Badge>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <Accordion>
              {storeState &&
                storeState.reportedPosts &&
                Object.entries(storeState.reportedPosts).map(
                  ([rKey, rValue], index) => (
                    <Card>
                      <Accordion.Toggle
                        as={Card.Header}
                        eventKey={`reportId-${index}`}
                      >
                        {`Příspěvek: ${rValue.timeStamp}`}
                      </Accordion.Toggle>
                      <Accordion.Collapse eventKey={`reportId-${index}`}>
                        <Card.Body>
                          <p>
                            Kategorie reportů:
                            {rValue &&
                              rValue.reports &&
                              rValue.reports
                                .map((r) => r.reportCategory)
                                .filter(onlyUniqueCategories)
                                .map((category, index) => (
                                  <Badge
                                    pill
                                    variant="danger"
                                    key={`reportCategoryKey-${index}`}
                                    style={{ marginLeft: "5px" }}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                          </p>
                          {rValue.reports && rValue.reports.length && (
                            <Accordion>
                              <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="0">
                                  Detail reportů: (
                                  {rValue.reports && rValue.reports.length})
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="0">
                                  <Card.Body>
                                    <Accordion>
                                      {rValue.reports.map((r, index) => (
                                        <Card>
                                          <Accordion.Toggle
                                            as={Card.Header}
                                            eventKey={`reportDetail-${index}`}
                                          >
                                            {`Detail reportu: ${r.reportCreated}`}
                                          </Accordion.Toggle>
                                          <Accordion.Collapse
                                            eventKey={`reportDetail-${index}`}
                                          >
                                            <Card.Body>
                                              <table>
                                                <tbody>
                                                  <tr>
                                                    <td>Reportováno dne:</td>
                                                    <td>
                                                      {convertToDate(
                                                        r.reportCreated
                                                      )}
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td>Reportoval:</td>
                                                    <td>{r.reportedBy}</td>
                                                  </tr>
                                                  <tr>
                                                    <td>Kategorie reportu:</td>
                                                    <td>{r.reportCategory}</td>
                                                  </tr>
                                                  <tr>
                                                    <td
                                                      style={{
                                                        paddingRight: "5px",
                                                      }}
                                                    >
                                                      Poznámka z reportu:
                                                    </td>
                                                    <td>{r.reportText}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </Card.Body>
                                          </Accordion.Collapse>
                                        </Card>
                                      ))}
                                    </Accordion>
                                  </Card.Body>
                                </Accordion.Collapse>
                              </Card>
                            </Accordion>
                          )}

                          <div style={{ margin: "15px 0 0" }}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deletePost(rKey, rValue.userId)}
                            >
                              smazat příspěvek
                            </Button>{" "}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => banUser(rKey, rValue.userId)}
                            >
                              smazat & zabanovat tvůrce
                            </Button>{" "}
                            <Button variant="secondary" size="sm">
                              vidět příspěvek
                            </Button>{" "}
                            <Button variant="success" size="sm">
                              příspěvek je v pořádku
                            </Button>
                          </div>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  )
                )}
            </Accordion>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </>
  );
};

export default ReportedPostsAccordion;
