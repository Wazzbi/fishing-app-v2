import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Auth";

// TODO change password z předešlé verze v gitu
// TODO GET data tady a né v Auth.js ...

const UserPage = () => {
  const { currentUserData } = useContext(AuthContext);

  useEffect(() => {
    localStorage.setItem("lastLocation", "/user");
  }, []);

  return (
    <>
      <h1>UserPage</h1>
      <br />
      <p>
        <b>{currentUserData && currentUserData.username}</b>
      </p>
      <p>{currentUserData && currentUserData.email}</p>
      <p>{currentUserData && currentUserData.role}</p>
    </>
  );
};

export default UserPage;
