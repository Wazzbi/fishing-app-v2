import React, { useEffect, useState, useContext } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";

import Table from "react-bootstrap/Table";

//TODO po přidání vynutit refresh records
//TODO update, delete on record
// TODO načtený data uložit do storu aby se při příští navštěvě page nemuseli data tahat znovu
// TODO delete pop up confirmation
// TODO addRow triggers refresh
// TODO refresh přes state
// TODO repetetivní getUserRecords pro refresh -> refactoring..
// TODO když není žádný record zobrazit text nic není

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);

  const doCreateRecordAndRefresh = () => {
    // TODO první udělat jako new promise a provést sériově za sebou
    firebaseService.createUserRecord(currentUser.uid);
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
  };

  const handleChangeRecordName = (userUid, recordUid, newRecordName) => {
    setRecords({
      ...records,
      [recordUid]: { ...records[recordUid], name: newRecordName },
    });

    const updatedRecord = {
      ...records[recordUid],
      name: newRecordName,
    };
    firebaseService.setUserRecord(userUid, recordUid, updatedRecord);
  };

  const editRecordName = (key) => {
    const elName = document.getElementById(`${key}-recordName`);
    elName.disabled = !elName.disabled;
  };

  const addRowAndRefresh = (recordUid) => {
    firebaseService.createUserRecordRow(currentUser.uid, recordUid);
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
  };

  const deleteRecord = (recordUid) => {
    firebaseService.deleteUserRecord(currentUser.uid, recordUid);
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
        Add record card
      </button>
      <br />
      <br />
      {!!records &&
        Object.entries(records).map(([key, value]) => (
          <>
            <div key={key}>
              <input
                id={`${key}-recordName`}
                name="recordName"
                type="recordName"
                placeholder="Record Name"
                onChange={(e) =>
                  handleChangeRecordName(currentUser.uid, key, e.target.value)
                }
                value={value && value.name ? value.name : ""}
                disabled
              />{" "}
              <button onClick={() => editRecordName(key)}>rename</button>{" "}
              <button onClick={() => addRowAndRefresh(key)}>add row</button>{" "}
              <button onClick={() => deleteRecord(key)}>delete</button>
              <br />
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>prop#1</th>
                    <th>prop#2</th>
                  </tr>
                </thead>
                <tbody>
                  {records &&
                    records[key] &&
                    records[key].data &&
                    Object.entries(records[key].data).map((row) => (
                      <tr>
                        <td>
                          <button>edit</button> <button>delete</button>
                        </td>
                        {/** row[0] = key row[1] = value */}
                        {Object.entries(row[1]).map(([key, value]) => (
                          <td>{value}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </Table>
              <br />
              <br />
            </div>
          </>
        ))}
    </>
  );
};

export default RecordPage;
