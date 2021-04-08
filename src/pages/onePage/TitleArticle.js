import React, { useEffect } from "react";
import "./onePage.scss";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO like btn + komentaře
// TODO pořdná animace než se načtou obr a pak modal
// TODO effect cleanUp

const TitleArticle = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", `/titleArticle`);
    // nasty react...
    // https://stackoverflow.com/questions/58431946/why-does-my-react-router-link-bring-me-to-the-middle-of-a-page
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="onePage-page_main">
        <div className="onePage-page-post">
          <Button
            variant="outline-dark"
            as={Link}
            to={"/home"}
            className="onePage-page_back-btn-icon"
            title="Back"
          ></Button>

          <div>
            <p className="onePage-page_title">
              <strong>Rybka v kostce</strong>
            </p>
            <p>
              <small style={{ color: "#808080", fontFamily: "poppins" }}>
                David Novotný {" | "} 31.3.2021 15:38
              </small>
            </p>
            <p className="onePage-page_icons-group">
              <Badge variant="dark">Info</Badge>
            </p>

            <div className="onePage-page_text">
              <p>
                RYBKA je projekt určený pro rybáře, lidi kteří mají rádi
                rybaření jako sport či rekreaci. Jsou zde vítaný i ostatní co
                mají rádi přírodu, vodáctví nebo turistiku. Rad bych zde
                vytrořil prostor pro tématiku týkající se zájmů a události lidí
                pro které je tato aplikace primárně určená.
              </p>
              <p>
                RYBKA je vedená jediným členem a proto je fungování těchto
                stránek tomu uzpůsobeno. Budu sbírat vaše podměty a nadále
                zlepšovat aplikaci, aby vyhovovala komunitě lidí, kteří ji budou
                používat.
              </p>
              <p>
                <b>Určitá specifikace, které se týkají RYBKY v této fázi:</b>
              </p>
              <ul>
                <li>
                  Příspěvky jsou možny vkládat jen ověřenými osobami, moderátory
                  nebo reprezentanty organizací. Je to tak z důvodů nešíření{" "}
                  <HashLink
                    to="titleArticle#NotAllowedContent"
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    nevhodného obsahu
                  </HashLink>
                  . Při porušení těchto pravidel může být uživateli zablokován
                  účet.
                </li>
                <li>
                  Uživateli který opakované reportuje příspěvky, které jsou
                  obsahově v souladu se zamýšleným obsahem aplikace RYBKA bude v
                  krajním případě účet smazán
                </li>
              </ul>
              <p>
                <b>Možnosti které jsem zde pro vás připravil:</b>
              </p>
              <ul>
                <li>
                  Vytvořte si roční záznam vašich úlovků a docházek, které se
                  budou automatickypřepisovat do souhrnu který je nutno předávat
                  rybářskému svazu.
                </li>
                <li>
                  Roční souhrny se automaticky generují na základě vašich zápisů
                  v záznamu. Tento souhrn můžete vyexportovat jako PDF a poslat
                  elektronicky či poštou na rybářský svaz.
                </li>
              </ul>

              <hr />
              <h4 id="NotAllowedContent">Nevhodný obsah</h4>
              <div style={{ padding: "10px 0 0" }}>
                <p>
                  <b>Zde je vydefinováno co je nevhodný obsah:</b>
                </p>
                <ul>
                  <li>Rasistický context</li>
                  <li>Sexistický context</li>
                  <li>Urážení menšin a jiných skupin</li>
                  <li>Šíření radikálních politických a náboženských názorů</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TitleArticle;
