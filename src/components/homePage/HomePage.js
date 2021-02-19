import React from "react";
import { Link } from "react-router-dom";

const HomePage = ({ history }) => {
  return (
    <>
      <h1>HomePage</h1>
      <Link to={"/news"}>News</Link>
      <br />
      <Link to={"/record"}>Record</Link>
      <br />
      <Link to={"/summary"}>Summary</Link>
    </>
  );
};

export default HomePage;
