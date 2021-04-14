import React, { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../Auth";
import { StoreContext } from "../../store/Store";
import "./adminPage.scss";
import Overview from "./components/overview/Overview";
import Tools from "./components/tools/Tools";
import Visits from "./components/visits/Visits";
import History from "./components/history/History";
import saveLastPathService from "../../services/utils/saveLastPath.service";

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
  const isMountedRef = useRef(true);
  const splitFullName =
    currentUserData &&
    currentUserData.username &&
    currentUserData.username.split(" ");
  const firstName = splitFullName && splitFullName[0];

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
          />

          <Tools
            isMountedRef={isMountedRef}
            storeState={storeState}
            dispatch={dispatch}
            currentUserData={currentUserData}
          />

          <Visits />

          <History storeState={storeState} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default AdminPage;
