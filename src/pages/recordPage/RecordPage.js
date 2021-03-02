import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import validatorService from "../../services/validators/validator.service";
import autocompleterService from "../../services/utils/autocompleter.service";
import { AuthContext } from "../../Auth";
import "./recordPage.scss";

import autocomplete from "autocompleter";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

// TODO funkce zabalit do usecallback
// TODO init download jen seznam záznamů (např jen prvních 5) a po rozkliknutí donačíst data
// TODOD řazení nejnovější nahoře
// TODO otestovat summary kterému smažu record
// TODO oddělit view do vlastního souboru

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [onDelete, setOnDelete] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [onAdd, setOnAdd] = useState(null);
  const [addNewRowValid, setAddNewRowValid] = useState(false); // dovolí uvožit prázdná pole, ale ne špatný vstupy
  const [today, setToday] = useState(null);

  const todayDate = () => {
    const today = new Date();
    const todayISO = today.toISOString().substr(0, 10);
    setToday(todayISO);
  };

  // validace je dvojená v handleChangeRecord
  const validator = (validatorType, value, elementId) => {
    const el = document.getElementById(elementId);
    const elementOk = () => {
      el.style.color = "initial";
      setAddNewRowValid(true);
    };
    const elementNok = () => {
      el.style.color = "red";
      setAddNewRowValid(false);
    };
    let isValid = false;
    switch (validatorType) {
      case "validateDistrictNumber":
        isValid =
          validatorService.validatorDistrictNumber(value) &&
          validatorService.validatorNoDigits(value);
        break;
      case "validateNoDigits":
        isValid = validatorService.validatorNoDigits(value);
        break;
      case "validate2Digits":
        isValid = validatorService.validate2Digits(value);
        break;

      default:
        break;
    }

    if (isValid) {
      elementOk();
      return true;
    } else {
      elementNok();
      return false;
    }
  };

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
    validatorType = null
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
    if (!!validatorType) {
      let isValid = false;
      switch (validatorType) {
        case "validateDistrictNumber":
          isValid = validator(
            "validateDistrictNumber",
            updatedValue,
            updatedCellId
          );
          break;

        case "validateNoDigits":
          isValid = validator("validateNoDigits", updatedValue, updatedCellId);
          break;

        case "validate2Digits":
          isValid = validator("validate2Digits", updatedValue, updatedCellId);
          break;

        default:
          break;
      }
      // když není validní nic neukládej do firebase
      if (!isValid) {
        return null;
      }
    }

    // pokud přepisuji pole kind...
    if (updatedKey === "kind") {
      var fishes = [{ label: "Kapr" }, { label: "Okoun" }];

      var input = document.getElementById(updatedCellId);

      //https://www.npmjs.com/package/autocompleter
      autocomplete({
        input: input,
        fetch: function (text, update) {
          text = text.toLowerCase();
          // you can also use AJAX requests instead of preloaded data
          var suggestions = fishes.filter((n) =>
            n.label.toLowerCase().startsWith(text)
          );
          update(suggestions);
        },
        minLength: 1,
        onSelect: function (item) {
          setRecords({
            ...records,
            [recordUid]: {
              ...records[recordUid],
              data: {
                ...records[recordUid].data,
                [updatedRow]: {
                  ...records[recordUid].data[updatedRow],
                  [updatedKey]: item.label,
                },
              },
            },
          });

          updatedRecord = {
            ...records[recordUid],
            data: {
              ...records[recordUid].data,
              [updatedRow]: {
                ...records[recordUid].data[updatedRow],
                [updatedKey]: item.label,
              },
            },
          };

          return firebaseService.setUserRecord(
            userUid,
            recordUid,
            updatedRecord
          );
        },
      });
    }

    let updatedRecord = {
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
      setAddNewRowValid(false);
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
    todayDate();
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
                                  e.target.value,
                                  `row-${rowKey}-kind`
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
                      <Form.Control
                        type="date"
                        name="date"
                        defaultValue={today}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>District Number</Form.Label>
                      <Form.Control
                        type="number"
                        name="districtNumber"
                        id={`${recordKey}form-districtNumber`}
                        onChange={(e) =>
                          validator(
                            "validateDistrictNumber",
                            e.target.value,
                            `${recordKey}form-districtNumber`
                          )
                        }
                      />
                      <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Subdistrict Number</Form.Label>
                      <Form.Control
                        type="number"
                        name="subdistrictNumber"
                        id={`${recordKey}form-subdistrictNumber`}
                        onChange={(e) =>
                          validator(
                            "validateNoDigits",
                            e.target.value,
                            `${recordKey}form-subdistrictNumber`
                          )
                        }
                      />
                      <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Kind</Form.Label>
                      <Form.Control
                        type="text"
                        name="kind"
                        id={`${recordKey}form-kind`}
                        autocomplete="off"
                        onChange={() =>
                          autocompleterService.do(`${recordKey}form-kind`)
                        }
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Pieces</Form.Label>
                      <Form.Control
                        type="number"
                        name="pieces"
                        id={`${recordKey}form-pieces`}
                        onChange={(e) =>
                          validator(
                            "validateNoDigits",
                            e.target.value,
                            `${recordKey}form-pieces`
                          )
                        }
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Kilograms</Form.Label>
                      <Form.Control
                        type="number"
                        step=".01"
                        name="kilograms"
                        id={`${recordKey}form-kilograms`}
                        onChange={(e) =>
                          validator(
                            "validate2Digits",
                            e.target.value,
                            `${recordKey}form-kilograms`
                          )
                        }
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Centimeters</Form.Label>
                      <Form.Control
                        type="number"
                        step=".01"
                        name="centimeters"
                        id={`${recordKey}form-centimeters`}
                        onChange={(e) =>
                          validator(
                            "validate2Digits",
                            e.target.value,
                            `${recordKey}form-centimeters`
                          )
                        }
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!addNewRowValid}
                    >
                      Submit
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
          </>
        ))}
    </>
  );
};

export default RecordPage;
