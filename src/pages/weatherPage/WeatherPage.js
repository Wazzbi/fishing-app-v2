import React, { useEffect } from "react";

// TODO počasí na oblíbených místech
// TODO nejlepší počasí v daný den na rybářských místech top 3
// TODO vyhlídky počasí

const WeatherPage = () => {
  useEffect(() => {
    localStorage.setItem("lastLocation", "/weather");
  }, []);

  return (
    <>
      <h1>WeatherPage</h1>
    </>
  );
};

export default WeatherPage;
