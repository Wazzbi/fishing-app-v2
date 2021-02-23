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
const newRecordRef = (uid) => appl.database().ref(`records/${uid}`);
const recordRef = (userUid, recordUid) =>
  appl.database().ref(`records/${userUid}/${recordUid}`);
const recordNewRowRef = (userUid, recordUid) =>
  appl.database().ref(`records/${userUid}/${recordUid}/data`);
const recordRowRef = (userUid, recordUid, recordRowUid) =>
  appl.database().ref(`records/${userUid}/${recordUid}/data/${recordRowUid}`);

class firebaseService {
  static auth = () => appl.auth();

  static firebaseUser = (uid) => user(uid);

  static firebaseUserRecords = (uid) => records(uid);

  static firebaseUserRecord = (userUid, recordUid) =>
    recordRef(userUid, recordUid);

  // TODO refactorovat GET metody (jsou téměř identický..)

  // *** GET ***
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

  // *** CREATE ***
  // TODO data upravit na konečnou podobu prázdného formuláře
  static createUserRecord = (uid) => {
    return newRecordRef(uid).push(
      {
        name: "New Record",
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  static createUserRecordRow = (userUid, recordUid) => {
    return recordNewRowRef(userUid, recordUid).push(
      {
        prop1: 111,
        prop2: 222,
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  // *** SET ***
  static setUserRecord = (userUid, recordUid, record) => {
    return recordRef(userUid, recordUid).set({
      ...record,
    });
  };

  // static setUserRecordAddRow = (userUid, recordUid, record) => {
  //   return recordRef(userUid, recordUid).set({
  //     ...record,
  //   });
  // };

  // *** DELETE ***
  static deleteUserRecord = (userUid, recordUid) => {
    return recordRef(userUid, recordUid).remove();
  };

  static deleteUserRecordRow = (userUid, recordUid, recordRowUid) => {
    return recordRowRef(userUid, recordUid, recordRowUid).remove();
  };
}

export default firebaseService;
