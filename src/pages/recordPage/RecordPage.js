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
// TODO addRow pop up a nasetovat init data

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

  const handleChangeRecord = (
    userUid,
    recordUid,
    updatedRow,
    updatedKey,
    updatedValue
  ) => {
    setRecords({
      ...records,
      [recordUid]: {
        ...records[recordUid],
        data: {
          ...records[recordUid].data,
          [updatedRow]: {
            ...records[recordUid].data[updatedRow],
            [updatedKey]: updatedValue,
          },
        },
      },
    });

    const updatedRecord = {
      ...records[recordUid],
      data: {
        ...records[recordUid].data,
        [updatedRow]: {
          ...records[recordUid].data[updatedRow],
          [updatedKey]: updatedValue,
        },
      },
    };
    firebaseService.setUserRecord(userUid, recordUid, updatedRecord);
  };

  const editRecordName = (key) => {
    const elName = document.getElementById(`${key}-recordName`);
    elName.disabled = !elName.disabled;
  };

  const editRow = (key) => {
    const elements = document.getElementsByClassName(`row-${key}`);
    for (let el of elements) {
      el.disabled = !el.disabled;
    }
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

  const deleteRecordRow = (recordUid, recordRowUid) => {
    firebaseService.deleteUserRecordRow(
      currentUser.uid,
      recordUid,
      recordRowUid
    );
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
        Object.entries(records).map(([recordKey, value]) => (
          <>
            <div key={recordKey}>
              <input
                id={`${recordKey}-recordName`}
                name="recordName"
                type="recordName"
                placeholder="Record Name"
                onChange={(e) =>
                  handleChangeRecordName(
                    currentUser.uid,
                    recordKey,
                    e.target.value
                  )
                }
                value={value && value.name ? value.name : ""}
                disabled
              />{" "}
              <button onClick={() => editRecordName(recordKey)}>rename</button>{" "}
              <button onClick={() => addRowAndRefresh(recordKey)}>
                add row
              </button>{" "}
              <button onClick={() => deleteRecord(recordKey)}>delete</button>
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
                    records[recordKey] &&
                    records[recordKey].data &&
                    Object.entries(records[recordKey].data).map(
                      ([rowKey, value]) => (
                        <tr>
                          <td>
                            <button onClick={() => editRow(rowKey)}>
                              edit
                            </button>{" "}
                            <button
                              onClick={() => deleteRecordRow(recordKey, rowKey)}
                            >
                              delete
                            </button>
                          </td>
                          {/** row[0] = key row[1] = value */}
                          {/** prop${index} přes index procházet číselník a použít normální názvy !!!index start 1*/}
                          {Object.entries(value).map(
                            ([propKey, value], index) => (
                              <td>
                                <input
                                  className={`row-${rowKey}`}
                                  name="prop"
                                  type="prop"
                                  onChange={(e) =>
                                    handleChangeRecord(
                                      currentUser.uid,
                                      recordKey,
                                      rowKey,
                                      `prop${index + 1}`,
                                      e.target.value
                                    )
                                  }
                                  value={value ? value : ""}
                                  disabled
                                />
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
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
