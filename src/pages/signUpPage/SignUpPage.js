import React, { useCallback, useState } from "react";
import firebaseService from "../../services/firebase/firebase.service";

//TODO back to landingpage

const SignUpPage = ({ history }) => {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  const onChangeUsername = (event) => {
    setUsername(event.target.value);
    setIsDisabled(!username || !email || !password);
  };
  const onChangeEmail = (event) => {
    setEmail(event.target.value);
    setIsDisabled(!username || !email || !password);
  };
  const onChangePassword = (event) => {
    setPassword(event.target.value);
    setIsDisabled(!username || !email || !password);
  };

  const handleSignUp = useCallback(
    async (event) => {
      event.preventDefault();
      const { username, email, password } = event.target.elements;
      const role = "user";
      try {
        await firebaseService
          .auth()
          .createUserWithEmailAndPassword(email.value, password.value)
          .then((authUser) => {
            firebaseService.firebaseUser(authUser.user.uid).set({
              username: username.value,
              email: email.value,
              password: password.value,
              role,
            });
          });
        history.push("/");
      } catch (error) {
        console.log(error);
        setError(error);
      }
    },
    [history]
  );

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSignUp}>
        <label>
          Username
          <input
            name="username"
            type="username"
            placeholder="Username"
            onChange={onChangeUsername}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={onChangeEmail}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={onChangePassword}
          />
        </label>
        <button type="submit" disabled={isDisabled}>
          Sign Up
        </button>
        {error && <p>{error.message}</p>}
      </form>
    </div>
  );
};

export default SignUpPage;
