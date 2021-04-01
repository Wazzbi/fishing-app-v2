import React, { useEffect, useState } from "react";
import firebaseService from "./services/firebase/firebase.service";
import "./App.scss";

import Spinner from "react-bootstrap/Spinner";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    firebaseService.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setPending(false);

      firebaseService
        .getUserData(user && user.uid)
        .then((res) =>
          res ? setCurrentUserData(res) : setCurrentUserData(null)
        );
    });
  }, []);

  if (pending) {
    return (
      <div className="auth_main">
        <h3>Načítání</h3>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
