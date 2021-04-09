import React, { useEffect } from "react";
import "./aboutPage.scss";

// TODO počasí na oblíbených místech
// TODO nejlepší počasí v daný den na rybářských místech top 3
// TODO vyhlídky počasí

const AboutPage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/about");
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="aboutPage-main">
        <div className="aboutPage-container">
          <h4>O aplikaci</h4>
          <p>ver. 0.1.10</p>
          <br />
          <p>
            Tato aplikace byla vytvořena na podmět mého bratra, rybáře, který my
            vnuknul tuto myšlenku - vytvořit aplikaci pro rybáře.
          </p>
          <p>•••</p>
          <p>
            Rybka je vytvářená v mém volném čase a rád na ní trávím čas! Budoucí
            doplňky, aktualizace a opravy budou stále prací. které budu věnovat
            svůj volný čas a proto mohou chvíli trvat.
          </p>
          <p>•••</p>
          <p>
            Tato aplikace je tu pro vás rybáře. Její obsah by měl být o
            ryvaření, volném čase u vody, co rybaření a vodohospodaření obnáší,
            jak to jde rybářům u nás tak i ve světě. Pomáhejte udržovat obsah v
            tomto směru. Není úmyslem vytvořit si zde klon facebooku nebo
            sbazar.
          </p>
          <p>•••</p>
          <p>Vaše podměty posílejte na xxxxx@yyyyy.com</p>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
