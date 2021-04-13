import React, { useEffect, useContext, useCallback } from "react";

import firebaseService from "../../../../services/firebase/firebase.service";
import ReportedPostsAccordion from "./components/ReportedPostsAccordion";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO získat z firebase seznam postů s reportFlagem

const Overview = ({
  firstname,
  isMountedRef,
  storeState,
  dispatch,
  currentUserData,
}) => {
  const deletePost = (id, creator) => {
    firebaseService.deletePost(id).then(() => {
      const filterReportedPosts =
        storeState &&
        storeState.reportedPosts &&
        Object.entries(storeState.reportedPosts).filter(
          ([rKey, rValue]) => +rKey !== +id
        );
      const filterPosts =
        storeState &&
        storeState.posts &&
        Object.entries(storeState.posts).filter(
          ([rKey, rValue]) => +rKey !== +id
        );

      const adminNote = {
        noteId: Date.now(),
        case: "Reported Post DELETED",
        detail: {
          creator,
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

      // nemaž v POSTS když nejsou načtený (např při refresh admin page)
      return storeState.posts
        ? [
            dispatch({
              type: "ADD_REPORTED_POSTS",
              payload: { ...Object.fromEntries(filterReportedPosts) },
            }),
            dispatch({
              type: "ADD_POSTS",
              payload: { ...Object.fromEntries(filterPosts) },
            }),
          ]
        : [
            dispatch({
              type: "ADD_REPORTED_POSTS",
              payload: { ...Object.fromEntries(filterReportedPosts) },
            }),
          ];
    });
  };

  /**
   * (un)ban user & erase reported post
   */
  const banUser = (postId, userId) => {
    firebaseService.getUser(userId).once("value", (snapshot) => {
      const user = Object.entries(snapshot.val()).map(([key, value]) => value);

      const firebaseId = user && user[0] && user[0].firebaseId;
      if (!!firebaseId) {
        firebaseService.setBlockedUser(firebaseId, user[0]).then(() => {
          deletePost(postId, userId);
          dispatch({
            type: "ADD_BLOCKED_USER",
            payload: user[0],
          });
        });
      }
    });
  };

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

    if (!storeState.adminNotes) {
      let ww = {};
      firebaseService.getAdminNotes().once("value", (snapshot) => {
        if (isMountedRef.current) {
          snapshot.forEach((childSnapshot) => {
            ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };
          });

          return dispatch({
            type: "ADD_ADMIN_NOTES",
            payload: { ...ww },
          });
        }
      });
    }
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
              <ReportedPostsAccordion
                storeState={storeState}
                deletePost={deletePost}
                banUser={banUser}
              />
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
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="2">
                  Události <Badge variant="danger">2</Badge>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="2">
                  <Card.Body>
                    <span>Nový uživatel xyz</span>
                    <hr />
                    <span>Nový uživatel xyz123</span>
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
