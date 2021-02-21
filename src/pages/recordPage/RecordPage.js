import React, { useEffect, useState, useContext } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";

//TODO po přidání vynutit refresh records
//TODO update, delete on record
// TODO načtený data uložit do storu aby se při příští navštěvě page nemuseli data tahat znovu

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);

  const doCreateRecordAndRefresh = (uid) => {
    // TODO první udělat jako new promise a provést sériově za sebou
    firebaseService.createUserRecord(currentUser.uid);
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
  };

  useEffect(() => {
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
  }, []);

  return (
    <>
      <h1>RecordPage</h1>
      <button onClick={() => doCreateRecordAndRefresh(currentUser.uid)}>
        Add record
      </button>
      <br />
      <br />
      {!!records &&
        Object.entries(records.records).map(([key, value]) => (
          <>
            <span key={key}>{value.name}</span> <button>edit</button>{" "}
            <button>delete</button>
            <br />
            <span>TABLE</span>
            <br />
            <br />
          </>
        ))}
    </>
  );
};

export default RecordPage;
