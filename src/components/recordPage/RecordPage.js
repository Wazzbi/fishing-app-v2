import React, { useContext } from "react";
import { AuthContext } from "../../Auth";

const RecordPage = () => {
  const { currentUserData } = useContext(AuthContext);

  return (
    <>
      <h1>RecordPage</h1>
      <br />
      <p>
        <b>{currentUserData && currentUserData.username}</b>
      </p>
      <p>{currentUserData && currentUserData.email}</p>
      <p>{currentUserData && currentUserData.role}</p>
    </>
  );
};

export default RecordPage;
