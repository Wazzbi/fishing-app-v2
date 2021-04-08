import React, { useEffect } from "react";
import "./adminPage.scss";

// TODO počasí na oblíbených místech
// TODO nejlepší počasí v daný den na rybářských místech top 3
// TODO vyhlídky počasí

const AdminPage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/admin");
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="admin-page_main">
        <h1>AdminPage</h1>
        <p>podle stupně role (moderátor, admin) povolit různé akce</p>
        <ul>
          <li>seznam nahlášených příspěvků + oznamovatel</li>
          <li>
            možnost dávání banů + poslat info o banu do mailu + notifikace při
            přihlášení
          </li>
          <li>mazání příspěvků</li>
          <li>historie provedených akcí v admin konzoly</li>
          <li>měnění rolí pro uživatele</li>
        </ul>
      </div>
    </>
  );
};

export default AdminPage;
