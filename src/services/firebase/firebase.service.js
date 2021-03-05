import app from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
};

const appl = app.initializeApp(config);

//TODO duplicitní reference
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

// *** Summary API ***
const summariesRef = (userUid) => appl.database().ref(`summaries/${userUid}`);
const summaryRef = (userUid, summaryUid) =>
  appl.database().ref(`summaries/${userUid}/${summaryUid}`);
const newSummaryRef = (summaryUid) =>
  appl.database().ref(`summaries/${summaryUid}`);

// *** Post API ***
const postsRef = appl.database().ref(`post/`);
const postImageRef = () => appl.storage().ref("images/test.png");

// TODO přejmenovat metody podle CRUD
class firebaseService {
  static auth = () => appl.auth();

  static firebaseUser = (uid) => user(uid);

  static firebaseUserRecords = (uid) => records(uid);

  static firebaseUserRecord = (userUid, recordUid) =>
    recordRef(userUid, recordUid);

  // TODO refactorovat GET metody (jsou téměř identický..)

  // *** GET ***
  static getUserData = async (uid) => {
    try {
      const snapshot = await user(uid).get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getUserRecords = async (uid) => {
    try {
      const snapshot = await records(uid).get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getUserSummaries = async (uid) => {
    try {
      const snapshot = await summariesRef(uid).get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // *** CREATE ***
  // TODO data upravit na konečnou podobu prázdného formuláře
  static createPost = (text) => {
    return postsRef.push(
      {
        text,
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  static createImage = (file) => {
    return postImageRef()
      .put(file, { contentType: "image/png" })
      .then((snapshot) => {
        console.log("Uploaded.");
      });
  };

  static createUserRecord = (uid) => {
    return newRecordRef(uid).push(
      {
        name: "New Record",
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  static createUserRecordRow = (userUid, recordUid, props) => {
    const {
      date,
      districtNumber,
      subdistrictNumber,
      kind,
      pieces,
      kilograms,
      centimeters,
    } = props;
    return recordNewRowRef(userUid, recordUid).push(
      {
        date,
        districtNumber,
        subdistrictNumber,
        kind,
        pieces,
        kilograms,
        centimeters,
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  static createUserSummary = (uid) => {
    return newSummaryRef(uid).push(
      {
        name: "New Summary",
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

  static setUserSummary = (userUid, summaryUid, summary) => {
    return summaryRef(userUid, summaryUid).set({
      ...summary,
    });
  };

  // *** DELETE ***
  static deleteUserRecord = (userUid, recordUid) => {
    return recordRef(userUid, recordUid).remove();
  };

  static deleteUserRecordRow = (userUid, recordUid, recordRowUid) => {
    return recordRowRef(userUid, recordUid, recordRowUid).remove();
  };

  static deleteUserSummary = (userUid, summaryUid) => {
    return summaryRef(userUid, summaryUid).remove();
  };
}

export default firebaseService;
