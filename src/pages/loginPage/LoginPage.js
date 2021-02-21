import React, { useCallback, useContext } from "react";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../../Auth.js";
import firebaseService from "../../services/firebase/firebase.service";
import { Link } from "react-router-dom";

const LoginPage = ({ history }) => {
  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await firebaseService
          .auth()
          .signInWithEmailAndPassword(email.value, password.value);
        history.push("/home");
      } catch (error) {
        alert(error);
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/home" />;
  }

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button type="submit">Log in</button>
      </form>
      <br />
      <Link to={"/signUp"}>Create new account</Link>
    </div>
  );
};

export default LoginPage;
