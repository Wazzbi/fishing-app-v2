import React, { useEffect } from "react";

// TODO počasí na oblíbených místech
// TODO nejlepší počasí v daný den na rybářských místech top 3
// TODO vyhlídky počasí

const SettingPage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/settings");
  }, []);

  return (
    <>
      <h1>SettingPage</h1>
    </>
  );
};

export default SettingPage;
