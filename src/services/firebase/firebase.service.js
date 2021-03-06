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
// TODO error handling zde
// TODO refactoring serives všecj viz https://stackoverflow.com/questions/35855781/having-services-in-react-application (post od Kildareflare)
// *** User API ***
const user = (uid) => appl.database().ref(`users/${uid}`);
const usersRef = appl.database().ref("users/");

// *** Record API ***
const records = (uid) => appl.database().ref(`records/${uid}`);
const record = (userUid, recordName) =>
  appl.database().ref(`records/${userUid}/${recordName}`);
const newRecordRef = (userUid) => appl.database().ref(`records/${userUid}`);

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
const postsRef = appl.database().ref(`posts/`);
const postRef = (id) => appl.database().ref(`posts/${id}`);

// *** Images API
const postImageRef = (name, size, type) =>
  appl.storage().ref(`images/${name}/${name}-${size}.${type}`);

// *** ADMIN notes***
const adminNotesRef = appl.database().ref("adminNotes/");

// *** BlockedPost API ***
const blockedPostsRef = appl.database().ref(`blockedPosts/`);
const blockedPostRef = (id) => appl.database().ref(`blockedPosts/${id}`);

// TODO přejmenovat metody podle CRUD
class firebaseService {
  // TODO toto může být jen export konstant...
  static auth = () => appl.auth();
  static firebaseUser = (uid) => user(uid);
  static firebaseUserRecords = (uid) => records(uid);
  static firebaseUserRecord = (userUid, recordUid) =>
    recordRef(userUid, recordUid);

  // TODO refactorovat GET metody (jsou téměř identický..)

  // *** GET ***
  static getImageUrl = (name, size, type) => {
    const defaultSize = size || 400;

    return appl
      .storage()
      .ref()
      .child(`images/${name}/${name}-${defaultSize}.${type}`)
      .getDownloadURL();
  };

  static getPosts = async () => {
    try {
      const snapshot = await postsRef.get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getPostsCount = async () => {
    try {
      const snapshot = await postsRef.get();
      if (snapshot.exists()) {
        return snapshot.numChildren();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getPost = async (id) => {
    try {
      const snapshot = await postRef(id).get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getBlockedPost = async (id) => {
    try {
      const snapshot = await blockedPostRef(id).get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getBlockedUsers = async () => {
    try {
      const snapshot = await usersRef
        .orderByChild("blockedUser")
        .equalTo(true)
        .get();
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error(error);
    }
  };

  static getUser = (id) => {
    return usersRef.orderByChild("id").equalTo(+id);
  };

  static checkUserExists = (username) => {
    return usersRef.orderByChild("username").equalTo(username);
  };

  static getReportedPosts = () => {
    return postsRef.orderByChild("reportedFlag").equalTo(true);
  };

  static getPostsInit = () => {
    return postsRef.orderByChild("timeStamp").limitToLast(10);
  };

  static getAdminNotes = () => {
    return adminNotesRef.orderByChild("noteId").limitToLast(100);
  };

  static getAdminNotesFiltered = (criterium, value) => {
    switch (criterium) {
      case "date":
        let startOfTheDay = `${value}000000`;
        let endOfTheDay = (+startOfTheDay + 86399999).toString();
        return adminNotesRef
          .orderByChild("noteId")
          .startAt(`${value}000000`)
          .endAt(endOfTheDay);
        break;
      case "case":
        return adminNotesRef
          .orderByChild("case")
          .equalTo(value)
          .limitToLast(100);
        break;
      case "userId":
        return adminNotesRef.orderByChild("detail/userId").equalTo(+value);
        break;
      case "solverId":
        return adminNotesRef.orderByChild("detail/solverId").equalTo(+value);
        break;

      default:
        break;
    }
  };

  static getPostsLimited = (timeStamp) => {
    return postsRef.orderByChild("timeStamp").endAt(timeStamp).limitToLast(5);
  };

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

  static getUserRecord = async (uid, recordName) => {
    try {
      const snapshot = await record(uid, recordName).get();
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

  static getUserSummary = async (uid, summaryName) => {
    try {
      const snapshot = await summaryRef(uid, summaryName).get();
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
  static createPost = (
    text,
    images,
    username,
    created,
    title,
    userId,
    category,
    postId
  ) => {
    const timeStamp = Date.now();

    return postsRef.child(postId).set(
      {
        title,
        text,
        images,
        timeStamp,
        username,
        created,
        userId,
        category,
      },
      (err) => console.log(err ? "error while pushing" : "successful push")
    );
  };

  static createImage = async (images = []) => {
    if (images) {
      for (const image of images) {
        await postImageRef(image.med.name, image.med.size, image.med.type).put(
          image.med.blob
        );

        await postImageRef(image.min.name, image.min.size, image.min.type).put(
          image.min.blob
        );
      }
    }
  };

  static createUserRecord = (userUid, recordId) => {
    return newRecordRef(userUid)
      .child(recordId)
      .set(
        {
          recordId,
        },
        (err) => console.log(err ? "error while pushing" : "successful push")
      );
  };

  static createAdminNote = (note) => {
    return adminNotesRef
      .child(note.noteId)
      .set(note, (err) =>
        console.log(err ? "error while pushing" : "successful push")
      );
  };

  static createUserRecordRow = (userUid, recordUid, props, rowId) => {
    const {
      date,
      districtNumber,
      subdistrictNumber,
      kind,
      pieces,
      kilograms,
      centimeters,
    } = props;
    return recordNewRowRef(userUid, recordUid)
      .child(rowId)
      .set(
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

  static createUserSummary = (userUid, summaryId) => {
    return newSummaryRef(userUid)
      .child(summaryId)
      .set(
        {
          summaryId,
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

  static setPost = (id, post) => {
    return postRef(id).set({
      ...post,
    });
  };

  static setUserData = (uid, data) => {
    return user(uid).set({
      ...data,
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

  static blockPost = (id) => {
    this.getPost(id)
      .then((post) => {
        blockedPostsRef.child(id).set(post);
      })
      .catch((err) => console.log(err));
    return postRef(id).remove();
  };
}

export default firebaseService;
