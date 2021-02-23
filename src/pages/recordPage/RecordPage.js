import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [onDelete, setOnDelete] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [onAdd, setOnAdd] = useState(null);

  const doDelete = () => {
    if (onDelete.element === "record") {
      const { recordUid } = onDelete.params;
      firebaseService.deleteUserRecord(currentUser.uid, recordUid);
    }
    if (onDelete.element === "row") {
      const { recordUid, recordRowUid } = onDelete.params;
      firebaseService.deleteUserRecordRow(
        currentUser.uid,
        recordUid,
        recordRowUid
      );
    }
    updateData();
  };

  const doCreateRecordAndRefresh = () => {
    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserRecord(currentUser.uid));
      reject(new Error("Currently unavaiable create record"));
    })
      .then(() => {
        firebaseService
          .getUserRecords(currentUser && currentUser.uid)
          .then((records) =>
            records ? setRecords(records) : setRecords(null)
          );
      })
      .catch(alert);
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

  const addRowAndRefresh = (recordUid, props) => {
    firebaseService.createUserRecordRow(currentUser.uid, recordUid, props);
    updateData();
  };

  const updateData = () => {
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
  };

  const handleCloseAndDelete = () => {
    setShowModalDelete(false);
    doDelete();
  };
  const handleDeleteClose = () => setShowModalDelete(false);
  const handleDeleteShow = () => setShowModalDelete(true);
  const handleDelete = (element, params) => {
    const text =
      element === "record"
        ? "Chcete opravdu smazat celý záznam?"
        : "Chcete opravdu smazat tento řádek?";
    handleDeleteShow();
    setOnDelete({
      element,
      params,
      text,
    });
  };

  const handleSubmitAdd = useCallback(
    async (event) => {
      handleAddClose();
      event.preventDefault();
      const { prop1, prop2 } = event.target.elements;
      addRowAndRefresh(onAdd, { prop1: prop1.value, prop2: prop2.value });
    },
    [addRowAndRefresh, onAdd]
  );
  const handleAddClose = () => setShowModalAdd(false);
  const handleAddShow = () => setShowModalAdd(true);
  const handleAdd = (recordKey) => {
    handleAddShow();
    setOnAdd(recordKey);
  };

  useEffect(() => {
    updateData();
  }, []);

  return (
    <>
      <h1>RecordPage</h1>
      <button onClick={() => doCreateRecordAndRefresh(currentUser.uid)}>
        Add record card
      </button>
      <br />
      <br />
      {!records && <p>No records... Add some :-)</p>}
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
              <button onClick={() => handleAdd(recordKey)}>add row</button>{" "}
              <button
                onClick={() => handleDelete("record", { recordUid: recordKey })}
              >
                delete
              </button>
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
                              onClick={() =>
                                handleDelete("row", {
                                  recordUid: recordKey,
                                  recordRowUid: rowKey,
                                })
                              }
                            >
                              delete
                            </button>
                          </td>
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

            <Modal
              show={showModalDelete}
              onHide={handleDeleteClose}
              animation={false}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Potvrdit akci</Modal.Title>
              </Modal.Header>
              <Modal.Body>{onDelete && onDelete.text}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleDeleteClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleCloseAndDelete}>
                  DELETE
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal
              show={showModalAdd}
              onHide={handleAddClose}
              animation={false}
              backdrop="static"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Vyplnit řádek</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleSubmitAdd}>
                  <Form.Group>
                    <Form.Label>Prop1</Form.Label>
                    <Form.Control type="number" name="prop1" />
                    <Form.Text className="text-muted">
                      We'll never share your email with anyone else.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Prop2</Form.Label>
                    <Form.Control type="number" name="prop2" />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </Modal.Body>
            </Modal>
          </>
        ))}
    </>
  );
};

export default RecordPage;
