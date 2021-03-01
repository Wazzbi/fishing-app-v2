import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

// TODO funkce zabalit do usecallback
// TODO init download jen seznam záznamů (např jen prvních 5) a po rozkliknutí donačíst data
// TODOD řazení nejnovější nahoře
// TODO otestovat summary kterému smažu record

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
    updatedValue,
    updatedCellId = null,
    validator = null
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

    // validator pro editaci polí
    // TODO validace při zakládání řádku
    // TODO vyvést to do servisy
    if (!!validator) {
      switch (validator) {
        case "validateDistrictNumber":
          if (updatedValue > 99999 && updatedValue < 1000000) {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "white";
            el.style.color = "initial";
          } else {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "#f8d7da";
            el.style.color = "#a8686d";
            return false;
          }
          break;

        case "validateNoDigits":
          if (/^\d+$/.test(updatedValue)) {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "white";
            el.style.color = "initial";
          } else {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "#f8d7da";
            el.style.color = "#a8686d";
            return false;
          }
          break;

        case "validate2Digits":
          if (/^\d+(?:\.\d{1,2})?$/.test(updatedValue)) {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "white";
            el.style.color = "initial";
          } else {
            const el = document.getElementById(updatedCellId);
            el.style.backgroundColor = "#f8d7da";
            el.style.color = "#a8686d";
            return false;
          }
          break;

        default:
          break;
      }
    }

    const updatedRecord = {
      ...records[recordUid],
      data: {
        ...records[recordUid].data,
        [updatedRow]: {
          ...records[recordUid].data[updatedRow],
          [updatedKey]:
            updatedKey === "kilograms" || updatedKey === "centimeters"
              ? Math.round(updatedValue * 100) / 100
              : updatedValue,
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
      const {
        date,
        districtNumber,
        subdistrictNumber,
        kind,
        pieces,
        kilograms,
        centimeters,
      } = event.target.elements;
      addRowAndRefresh(onAdd, {
        date: date.value,
        districtNumber: districtNumber.value,
        subdistrictNumber: subdistrictNumber.value,
        kind: kind.value,
        pieces: pieces.value,
        kilograms: kilograms.value,
        centimeters: centimeters.value,
      });
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
      <button onClick={doCreateRecordAndRefresh}>Add record card</button>
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
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Date</th>
                    <th>District Number</th>
                    <th>Subdistrict Number</th>
                    <th>Kind</th>
                    <th>Pieces</th>
                    <th>Kilograms</th>
                    <th>Centimeters</th>
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

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-date`}
                              type="date"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "date",
                                  e.target.value
                                )
                              }
                              value={value.date ? value.date : ""}
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-districtNumber`}
                              type="number"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "districtNumber",
                                  e.target.value,
                                  `row-${rowKey}-districtNumber`,
                                  "validateDistrictNumber"
                                )
                              }
                              value={
                                value.districtNumber ? value.districtNumber : ""
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-subdistrictNumber`}
                              type="number"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "subdistrictNumber",
                                  e.target.value,
                                  `row-${rowKey}-subdistrictNumber`,
                                  "validateNoDigits"
                                )
                              }
                              value={
                                value.subdistrictNumber
                                  ? value.subdistrictNumber
                                  : ""
                              }
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-kind`}
                              type="text"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "kind",
                                  e.target.value
                                )
                              }
                              value={value.kind ? value.kind : ""}
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-pieces`}
                              type="number"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "pieces",
                                  e.target.value,
                                  `row-${rowKey}-pieces`,
                                  "validateNoDigits"
                                )
                              }
                              value={value.pieces ? value.pieces : ""}
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-kilograms`}
                              type="number"
                              step=".01"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "kilograms",
                                  e.target.value,
                                  `row-${rowKey}-kilograms`,
                                  "validate2Digits"
                                )
                              }
                              value={value.kilograms ? value.kilograms : ""}
                              disabled
                            />
                          </td>

                          <td>
                            <input
                              className={`row-${rowKey}`}
                              id={`row-${rowKey}-centimeters`}
                              type="number"
                              step=".01"
                              onChange={(e) =>
                                handleChangeRecord(
                                  currentUser.uid,
                                  recordKey,
                                  rowKey,
                                  "centimeters",
                                  e.target.value,
                                  `row-${rowKey}-centimeters`,
                                  "validate2Digits"
                                )
                              }
                              value={value.centimeters ? value.centimeters : ""}
                              disabled
                            />
                          </td>
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
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" name="date" />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>District Number</Form.Label>
                    <Form.Control type="number" name="districtNumber" />
                    <Form.Text className="text-muted">
                      We'll never share your email with anyone else.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Subdistrict Number</Form.Label>
                    <Form.Control type="number" name="subdistrictNumber" />
                    <Form.Text className="text-muted">
                      We'll never share your email with anyone else.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Kind</Form.Label>
                    <Form.Control type="text" name="kind" />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Pieces</Form.Label>
                    <Form.Control type="number" name="pieces" />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Kilograms</Form.Label>
                    <Form.Control type="number" step=".01" name="kilograms" />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Centimeters</Form.Label>
                    <Form.Control type="number" step=".01" name="centimeters" />
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
