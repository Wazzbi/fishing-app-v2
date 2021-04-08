import React, { useEffect } from "react";
import "./weatherPage.scss";

// TODO počasí na oblíbených místech
// TODO nejlepší počasí v daný den na rybářských místech top 3
// TODO vyhlídky počasí

const WeatherPage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/weather");
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="weather-page_main">
        <h1>WeatherPage</h1>
      </div>
    </>
  );
};

export default WeatherPage;
