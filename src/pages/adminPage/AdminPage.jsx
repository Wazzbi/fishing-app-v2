import React, { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../Auth";
import "./adminPage.scss";
import Overview from "./components/overview/Overview";
import Tools from "./components/tools/Tools";
import Visits from "./components/visits/Visits";
import History from "./components/history/History";

// TODO podle stupně role (moderátor, admin) povolit různé akce
// TODO seznam nahlášených příspěvků + oznamovatel
// TODO možnost dávání banů + poslat info o banu do mailu + notifikace při přihlášení
// TODO mazání příspěvků
// TODO historie provedených akcí v admin konzoly
// TODO měnění rolí pro uživatele
// TODO zde zobrazovat zprávy od uživatelů

const AdminPage = ({ history }) => {
  const { currentUserData } = useContext(AuthContext);
  const isMountedRef = useRef(true);
  const splitFullName =
    currentUserData &&
    currentUserData.username &&
    currentUserData.username.split(" ");
  const firstName = splitFullName && splitFullName[0];

  useEffect(() => {
    localStorage.setItem("lastLocation", "/admin");
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
          <Overview firstname={firstName} isMountedRef={isMountedRef} />

          <Tools />

          <Visits />

          <History />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default AdminPage;
