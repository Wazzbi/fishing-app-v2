import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
};

const appl = app.initializeApp(config);

// *** User API ***
const user = (uid) => appl.database().ref(`users/${uid}`);
// const users = () => appl.database().ref("users");

// *** Record API ***
const records = (uid) => appl.database().ref(`records/${uid}`);
const newRecord = (uid) => appl.database().ref(`records/${uid}/records`);
const record = (uid, recordName) =>
  appl.database().ref(`records/${uid}/${recordName}`);

class firebaseService {
  static auth = () => appl.auth();

  static firebaseUser = (uid) => user(uid);

  static firebaseUserRecords = (uid) => records(uid);

  // TODO refactorovat GET metody (jsou téměř identický..)

  static getUserData = (uid) => {
    return user(uid)
      .get()
      .then(function (snapshot) {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          console.log("No data available");
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  static getUserRecords = (uid) => {
    return records(uid)
      .get()
      .then(function (snapshot) {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          console.log("No data available");
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  static createUserRecord = (uid) => {
    return newRecord(uid).push(
      {
        name: "New Record",
        data: {
          prop1: "",
          prop2: "",
        },
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };
}

export default firebaseService;
