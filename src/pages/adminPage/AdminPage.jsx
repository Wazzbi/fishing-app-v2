import React, {
  useEffect,
  useContext,
  useRef,
  useCallback,
  useState,
} from "react";
import { AuthContext } from "../../Auth";
import { StoreContext } from "../../store/Store";
import "./adminPage.scss";
import Overview from "./components/overview/Overview";
import Tools from "./components/tools/Tools";
import Visits from "./components/visits/Visits";
import History from "./components/history/History";
import saveLastPathService from "../../services/utils/saveLastPath.service";
import firebaseService from "../../services/firebase/firebase.service";

// TODO podle stupně role (moderátor, admin) povolit různé akce
// TODO seznam nahlášených příspěvků + oznamovatel
// TODO možnost dávání banů + poslat info o banu do mailu + notifikace při přihlášení
// TODO mazání příspěvků
// TODO historie provedených akcí v admin konzoly
// TODO měnění rolí pro uživatele
// TODO zde zobrazovat zprávy od uživatelů

const AdminPage = ({ history }) => {
  const [storeState, dispatch] = useContext(StoreContext);
  const { currentUserData } = useContext(AuthContext);
  const [searchUser, setSearchUser] = useState(null);

  const isMountedRef = useRef(true);
  const splitFullName =
    currentUserData &&
    currentUserData.username &&
    currentUserData.username.split(" ");
  const firstName = splitFullName && splitFullName[0];

  const convertToDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const getFilteredAdminNotes = (criterium, value) => {
    let ww = {};
    firebaseService
      .getAdminNotesFiltered(criterium, value)
      .once("value", (snapshot) => {
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
  };

  const getAdminNotes = () => {
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
  };

  const getUser = (event) => {
    event.preventDefault();
    const { userId } = event.target.elements;
    firebaseService.getUser(userId.value).once("value", (snapshot) => {
      const users =
        snapshot &&
        snapshot.val() &&
        Object.entries(snapshot.val()).map(([key, value]) => value);
      const user = users && users[0];
      setSearchUser(user);
    });
  };

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
        const adminNote = {
          noteId: Date.now().toString(),
          case: "User UNBLOCKED",
          detail: {
            username: user.username,
            userId: user.id,
            postUrl: user.postUrl ? user.postUrl : null,
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
      })
      .then(() => {
        if (!!searchUser) {
          // aktualizuj data zobrazeného uživatele
          firebaseService.getUser(searchUser.id).once("value", (snapshot) => {
            const users =
              snapshot &&
              snapshot.val() &&
              Object.entries(snapshot.val()).map(([key, value]) => value);
            const user = users && users[0];
            setSearchUser(user);
          });
        }
      })
      .catch((err) => console.log(err));
  };

  // TODO tyto konstrukce s snapshot mohou být v servise a né tady...
  /*
   * propName = "blockedUser" || "role"
   * newValue = boolean || string
   */
  const changeSearchUserProp = (propName, newValue, note = null) => {
    // změn prop uživatele
    firebaseService
      .setUserData(searchUser.firebaseId, {
        ...searchUser,
        [propName]: newValue,
        postUrl:
          propName === "blockedUser"
            ? null
            : searchUser.postUrl
            ? searchUser.postUrl
            : null, // pokud uživatele blokuji z konzole smaž referenci na post kvůli kterému dostal předtím ban a ošetři když chybí
      })
      .then(() => {
        // notifikuj změnu v datech uživatele
        const adminNote = {
          noteId: Date.now().toString(),
          case: "User Data CHANGED",
          detail: {
            username: searchUser.username,
            userId: searchUser.id,
            postUrl:
              propName === "blockedUser"
                ? null
                : searchUser.postUrl
                ? searchUser.postUrl
                : null, // pokud uživatele blokuji z konzole smaž referenci na post kvůli kterému dostal předtím ban a ošetři když chybí
            solverNote: `Changed ${propName} to ${newValue.toString()}`,
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
      })
      .then(() => {
        // aktualizuj data zobrazeného uživatele
        firebaseService
          .getUser(searchUser.id)
          .once("value", (snapshot) => {
            const users =
              snapshot &&
              snapshot.val() &&
              Object.entries(snapshot.val()).map(([key, value]) => value);
            const user = users && users[0];
            setSearchUser(user);
          })
          .then(() => {
            //pokud se mění stav blockUser aktualizuj i seznam blokovaných uživatelů
            if (propName === "blockedUser") {
              firebaseService
                .getBlockedUsers()
                .then((blockedUsers) => {
                  return dispatch({
                    type: "ADD_BLOCKED_USERS",
                    payload: blockedUsers,
                  });
                })
                .then(() => {
                  // notifikuj že je uživatel zablokovaný
                  const adminNote = {
                    noteId: Date.now().toString(),
                    case: "User BLOCKED",
                    detail: {
                      username: searchUser.username,
                      userId: searchUser.id,
                      // postUrl: user.postUrl, NENÍ PŘÍSPĚVĚK JAKO PODMĚT ZABLOKOVÁNÍ
                      solverNote: note,
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
                })
                .catch((err) => console.error(err));
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getReportedPosts();

    if (!storeState.adminNotes) {
      getAdminNotes();
    }
  }, []);

  useEffect(() => {
    saveLastPathService.setWithExpiry("lastLocation", "/admin");
    window.scrollTo(0, 0);

    return () => (isMountedRef.current = false);
  }, []);

  useEffect(() => {
    // nepostit uživatele bez oprávnění na page admin
    if (currentUserData && currentUserData.role === "user") {
      history.push("/home");
    }
  });

  return (
    <>
      {currentUserData && currentUserData.role !== "user" ? (
        <div className="admin-page_main">
          <Overview
            firstname={firstName}
            isMountedRef={isMountedRef}
            storeState={storeState}
            dispatch={dispatch}
            currentUserData={currentUserData}
            convertToDate={convertToDate}
          />

          <Tools
            isMountedRef={isMountedRef}
            storeState={storeState}
            dispatch={dispatch}
            currentUserData={currentUserData}
            getUser={getUser}
            searchUser={searchUser}
            convertToDate={convertToDate}
            handleUnBlockUser={handleUnBlockUser}
            changeSearchUserProp={changeSearchUserProp}
          />

          <Visits />

          <History
            storeState={storeState}
            getFilteredAdminNotes={getFilteredAdminNotes}
            getAdminNotes={getAdminNotes}
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default AdminPage;
