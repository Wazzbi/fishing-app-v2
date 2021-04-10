import React, { useEffect, useContext, useCallback } from "react";
import { StoreContext } from "../../../../store/Store";
import firebaseService from "../../../../services/firebase/firebase.service";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO získat z firebase seznam postů s reportFlagem

const Overview = ({ firstname, isMountedRef }) => {
  const [storeState, dispatch] = useContext(StoreContext);

  const getReportedPosts = useCallback(() => {
    let ww = {};
    firebaseService.getReportedPosts().once("value", (snapshot) => {
      if (isMountedRef.current) {
        snapshot.forEach((childSnapshot) => {
          ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };

          // přidej titulní obrázek do objektu
          Object.entries(ww).map(([postKey, postValue]) => {
            if (postValue.images) {
              firebaseService
                .getImageUrl(
                  postValue.images[0].imageName,
                  400,
                  postValue.images[0].imageType
                )
                .then((imageUrl) => {
                  postValue.titleImage = imageUrl;

                  return dispatch({
                    type: "ADD_REPORTED_POSTS",
                    payload: { ...storeState.reportedPosts, ...ww },
                  });
                });
            }
          });

          return dispatch({
            type: "ADD_REPORTED_POSTS",
            payload: { ...storeState.reportedPosts, ...ww },
          });
        });
      }
    });
  }, [dispatch, storeState.posts]);

  useEffect(() => {
    getReportedPosts();
  }, []);

  return (
    <>
      <div className="admin-page-section">
        <div>
          <p className="admin-page_title">
            <strong>Ahoj {firstname}!</strong>
          </p>

          <p>Uroveň oprávnění: 3</p>

          {storeState && storeState.reportedPosts && (
            <Accordion>
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0">
                  Reportované příspěvky{" "}
                  <Badge variant="danger">
                    {Object.keys(storeState.reportedPosts).length}
                  </Badge>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    {storeState &&
                      storeState.reportedPosts &&
                      Object.entries(storeState.reportedPosts).map(
                        ([rKey, rValue], index) => (
                          <Accordion>
                            <Accordion.Toggle as={Card.Header} eventKey="0">
                              {rValue.timeStamp}
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                              <Card.Body>
                                <div>
                                  kategorie reportů: ZDE POLE UNIKÁTNÍCH TYPŮ
                                  KATEGORIÍ
                                </div>
                                {rValue.reports && rValue.reports.length && (
                                  <Accordion>
                                    <Accordion.Toggle
                                      as={Card.Header}
                                      eventKey="0"
                                    >
                                      Detail reportů: (
                                      {rValue.reports && rValue.reports.length})
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                      <Card.Body>
                                        {rValue.reports.map((r) => (
                                          <Accordion>
                                            <Accordion.Toggle
                                              as={Card.Header}
                                              eventKey="0"
                                            >
                                              {`Detail reportu: ${r.reportCreated}`}
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey="0">
                                              <Card.Body>
                                                <div>
                                                  Reportováno dne:{" "}
                                                  {r.reportCreated}
                                                </div>
                                                <div>
                                                  Reportoval: {r.reportedBy}
                                                </div>
                                                <div>
                                                  Kategorie reportu:{" "}
                                                  {r.reportCategory}
                                                </div>
                                                <div>
                                                  Poznámka z reportu:{" "}
                                                  {r.reportText}
                                                </div>
                                              </Card.Body>
                                            </Accordion.Collapse>
                                          </Accordion>
                                        ))}
                                      </Card.Body>
                                    </Accordion.Collapse>
                                  </Accordion>
                                )}

                                <div style={{ margin: "5px 0" }}>
                                  <Button variant="danger">
                                    skrýt příspěvek
                                  </Button>{" "}
                                  <Button variant="danger">
                                    smazat příspěvek
                                  </Button>{" "}
                                  <Button variant="danger">
                                    zabanovat tvůrce
                                  </Button>{" "}
                                  <Button variant="secondary">
                                    vidět příspěvek
                                  </Button>
                                </div>
                              </Card.Body>
                            </Accordion.Collapse>
                          </Accordion>
                        )
                      )}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="1">
                  Zprávy <Badge variant="danger">24</Badge>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <span>zpráva 1</span>
                    <hr />
                    <span>zpráva 2</span>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          )}
        </div>
      </div>
    </>
  );
};

export default Overview;
