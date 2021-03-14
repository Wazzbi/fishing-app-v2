import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import validatorService from "../../services/validators/validator.service";
import autocompleterService from "../../services/utils/autocompleter.service";
import { AuthContext } from "../../Auth";
import "./recordPage.scss";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

// TODO funkce zabalit do usecallback
// TODO init download jen seznam záznamů (např jen prvních 5) a po rozkliknutí donačíst data
// TODO řazení nejnovější nahoře
// TODO oddělit view do vlastního souboru
// TODO validace jen přes modal (vyčistí to kód) udělat edit row v stejným modalu
// TODO modaly mít taky samostatných souborech
// TODO nešel by today získat i jinak než ho mít ve state
// !! řazení je ve stylech od nejnovějšího k nejstaršího

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [onDelete, setOnDelete] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [onAdd, setOnAdd] = useState(null);
  const [today, setToday] = useState(null);
  const [editRowData, setEditRowData] = useState(null);

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
    };
    const elementNok = () => {
      el.style.color = "red";
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
      // return true;
    } else {
      elementNok();
      // return false;
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

  const editRow = (recordUid, rowUid, rowValue) => {
    setEditRowData({ recordUid, rowUid, rowValue });
    handleAddShow();
  };

  const handleSubmitChange = (event) => {
    // TODO musel jsem to rozbalit z callback zkusit znovu zabalit jako druhou handle funkci
    // TODO když se nic nezmění nic neposílat a neměmit v useState
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

    const updatedRow = {
      date: date.value,
      districtNumber: districtNumber.value,
      subdistrictNumber: subdistrictNumber.value,
      kind: kind.value,
      pieces: pieces.value,
      kilograms: kilograms.value,
      centimeters: centimeters.value,
    };

    setRecords({
      ...records,
      [editRowData.recordUid]: {
        ...records[editRowData.recordUid],
        data: {
          ...records[editRowData.recordUid].data,
          [editRowData.rowUid]: updatedRow,
        },
      },
    });

    let updatedRecord = {
      ...records[editRowData.recordUid],
      data: {
        ...records[editRowData.recordUid].data,
        [editRowData.rowUid]: updatedRow,
      },
    };

    firebaseService.setUserRecord(
      currentUser.uid,
      editRowData.recordUid,
      updatedRecord
    );

    setEditRowData(null);
  };

  const editRecordName = (key) => {
    const elName = document.getElementById(`${key}-recordName`);
    elName.disabled = !elName.disabled;
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
      setEditRowData(null);
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
  const handleAddClose = () => {
    setEditRowData(null);
    setShowModalAdd(false);
  };
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
      <div className="record-page_main">
        <Button
          variant="primary"
          className="record-page-add-btn"
          onClick={doCreateRecordAndRefresh}
        >
          Add record card
        </Button>
        <br />
        <br />
        {!records && <p>No records... Add some :-)</p>}
        <div className="record-page_records">
          {!!records &&
            Object.entries(records).map(([recordKey, value]) => (
              <>
                <div key={recordKey} className="record-page_table">
                  <InputGroup className="record-page_record-name">
                    <FormControl
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
                    />

                    <DropdownButton
                      as={InputGroup.Append}
                      variant="outline-secondary"
                      title="Menu"
                      id="input-group-dropdown-2"
                    >
                      <Dropdown.Item onClick={() => editRecordName(recordKey)}>
                        rename
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleAdd(recordKey)}>
                        add row
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        className="record-page_delete-text"
                        onClick={() =>
                          handleDelete("record", { recordUid: recordKey })
                        }
                      >
                        delete
                      </Dropdown.Item>
                    </DropdownButton>
                  </InputGroup>

                  <Table responsive bordered hover size="sm">
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
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="record-page_row-btn"
                                  onClick={() =>
                                    editRow(recordKey, rowKey, value)
                                  }
                                >
                                  <img
                                    src="/edit.svg"
                                    width="15px"
                                    height="15px"
                                  ></img>
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="record-page_row-btn"
                                  onClick={() =>
                                    handleDelete("row", {
                                      recordUid: recordKey,
                                      recordRowUid: rowKey,
                                    })
                                  }
                                >
                                  <img
                                    src="/delete.svg"
                                    width="15px"
                                    height="15px"
                                  ></img>
                                </Button>
                                {!!!value.kind ||
                                !!!value.pieces ||
                                !!!value.kilograms ? (
                                  <span
                                    title="chybějící povinná data: druh ryby, váha nebo počet kusů"
                                    style={{
                                      color: "red",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    }}
                                  >
                                    (!)
                                  </span>
                                ) : (
                                  ""
                                )}
                                {!!!value.centimeters ? (
                                  <span
                                    title="chybějící data: centimetry"
                                    style={{
                                      color: "blue",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    }}
                                  >
                                    (!)
                                  </span>
                                ) : (
                                  ""
                                )}
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-date`}
                                >
                                  {value.date ? value.date : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-districtNumber`}
                                >
                                  {value.districtNumber
                                    ? value.districtNumber
                                    : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-subdistrictNumber`}
                                >
                                  {value.subdistrictNumber
                                    ? value.subdistrictNumber
                                    : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-kind`}
                                >
                                  {value.kind ? value.kind : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-pieces`}
                                >
                                  {value.pieces ? value.pieces : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-kilograms`}
                                >
                                  {value.kilograms ? value.kilograms : ""}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`row-${rowKey}`}
                                  id={`row-${rowKey}-centimeters`}
                                >
                                  {value.centimeters ? value.centimeters : ""}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </Table>

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
                      <Modal.Title>
                        {!!editRowData ? "Upravit řádek" : "Vyplnit řádek"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form
                        onSubmit={
                          !!editRowData ? handleSubmitChange : handleSubmitAdd
                        }
                      >
                        <Form.Group>
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="date"
                            defaultValue={
                              !!editRowData ? editRowData.rowValue.date : today
                            }
                          />
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>District Number</Form.Label>
                          <Form.Control
                            required
                            type="number"
                            name="districtNumber"
                            id={`${recordKey}form-districtNumber`}
                            defaultValue={
                              !!editRowData
                                ? editRowData.rowValue.districtNumber
                                : ""
                            }
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
                            required
                            type="number"
                            name="subdistrictNumber"
                            id={`${recordKey}form-subdistrictNumber`}
                            defaultValue={
                              !!editRowData
                                ? editRowData.rowValue.subdistrictNumber
                                : ""
                            }
                            onChange={(e) =>
                              validator(
                                "validateNoDigits",
                                e.target.value,
                                `${recordKey}form-subdistrictNumber`
                              )
                            }
                          />
                          <Form.Text className="text-muted">
                            Pokud podokresek nemá číslo vyplňte nulu.
                          </Form.Text>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Kind</Form.Label>
                          <Form.Control
                            type="text"
                            name="kind"
                            id={`${recordKey}form-kind`}
                            autoComplete="off"
                            defaultValue={
                              !!editRowData ? editRowData.rowValue.kind : ""
                            }
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
                            defaultValue={
                              !!editRowData ? editRowData.rowValue.pieces : ""
                            }
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
                            defaultValue={
                              !!editRowData
                                ? editRowData.rowValue.kilograms
                                : ""
                            }
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
                            defaultValue={
                              !!editRowData
                                ? editRowData.rowValue.centimeters
                                : ""
                            }
                            onChange={(e) =>
                              validator(
                                "validate2Digits",
                                e.target.value,
                                `${recordKey}form-centimeters`
                              )
                            }
                          />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                          Submit
                        </Button>
                      </Form>
                    </Modal.Body>
                  </Modal>
                </div>
              </>
            ))}
        </div>
      </div>
    </>
  );
};

export default RecordPage;
