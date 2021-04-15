import React, { useEffect, useContext, useCallback } from "react";

import firebaseService from "../../../../services/firebase/firebase.service";
import ReportedPostsAccordion from "./components/ReportedPostsAccordion";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO získat z firebase seznam postů s reportFlagem
// TODO ban / unban do historie
// TODO notifikace ADD_ADMIN_NOTE je na několika místech -> udělat servisu nebo něco

const Overview = ({
  firstname,
  isMountedRef,
  storeState,
  dispatch,
  currentUserData,
}) => {
  const freePost = (post) => {
    console.log(post);
    // zruš flag který filtruje reportované příspěvky
    post.reportedFlag = false;
    // reset report in post
    firebaseService
      .setPost(post.timeStamp, post)
      .catch((err) => console.log(err));

    const filterReportedPosts =
      storeState &&
      storeState.reportedPosts &&
      Object.entries(storeState.reportedPosts).filter(
        ([rKey, rValue]) => +rKey !== +post.timeStamp
      );

    dispatch({
      type: "ADD_REPORTED_POSTS",
      payload: { ...Object.fromEntries(filterReportedPosts) },
    });

    const base_url = window.location.origin;

    const adminNote = {
      noteId: Date.now().toString(),
      case: "Reported Post FREE",
      detail: {
        username: post.username,
        userId: post.userId,
        postUrl: `${base_url}/#/post/${post.timeStamp}`,
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
      .catch((err) => console.error(err));
  };

  const deletePost = (id, user) => {
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

      const base_url = window.location.origin;

      const adminNote = {
        noteId: Date.now().toString(),
        case: "Reported Post BLOCKED",
        detail: {
          username: user.username,
          userId: user.userId,
          postUrl: `${base_url}/#/blockedPost/${id}`,
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
  const banUser = (postId, user) => {
    const base_url = window.location.origin;
    firebaseService.getUser(user.userId).once("value", (snapshot) => {
      let _users = Object.entries(snapshot.val()).map(([key, value]) => value);
      // přidat do objektu zabanvané osoby i post kvůli kterému dostal ban
      _users[0].postUrl = `${base_url}/#/blockedPost/${postId}`;

      const firebaseId = _users && _users[0] && _users[0].firebaseId;
      if (!!firebaseId) {
        firebaseService.setBlockedUser(firebaseId, _users[0]).then(() => {
          deletePost(postId, user);
          dispatch({
            type: "ADD_BLOCKED_USER",
            payload: _users[0],
          });

          const adminNote = {
            noteId: Date.now().toString(),
            case: "User BLOCKED",
            detail: {
              username: user.username,
              userId: user.userId,
              postUrl: `${base_url}/#/blockedPost/${postId}`,
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
        });
      }
    });
  };

  return (
    <>
      <div className="admin-page-section">
        <div>
          <p className="admin-page_title">
            <strong>Ahoj {firstname}!</strong>
          </p>

          <p>Uroveň oprávnění: 3</p>

          <Accordion>
            <ReportedPostsAccordion
              storeState={storeState}
              deletePost={deletePost}
              banUser={banUser}
              freePost={freePost}
            />
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="1">
                <div
                  style={{
                    width: "120px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Zprávy</span> <Badge variant="danger">24</Badge>
                </div>
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
                <div
                  style={{
                    width: "120px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Události</span> <Badge variant="danger">2</Badge>
                </div>
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
        </div>
      </div>
    </>
  );
};

export default Overview;
