import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import firebaseService from "../../services/firebase/firebase.service";
import validatorService from "../../services/validators/validator.service";
import autocompleterService from "../../services/utils/autocompleter.service";
import { AuthContext } from "../../Auth";
import "./recordPage.scss";
import { StoreContext } from "../../store/Store";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import { fishKind } from "../../constants";

// TODO funkce zabalit do usecallback
// TODO init download jen seznam záznamů (např jen prvních 5) a po rozkliknutí donačíst data
// TODO oddělit view do vlastního souboru
// TODO modaly mít taky samostatných souborech
// TODO nešel by today získat i jinak než ho mít ve state
// TODO při přechodu na jiné stránky dochází k opětovnému načítání dat -> redux
// TODO vyřešit vykřičkníky v poli actions když chybí nějaké data
// TODO když se vrátím zpět tak na nascrollovanou pozici (posty do reduxu)
// TODO loading spiner než se načtou posty
// TODO dát ikonku u remane odemčený / zamčený zámek
// !! řazení je ve stylech od nejnovějšího k nejstaršího

const RecordPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [onDelete, setOnDelete] = useState(null);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [onAdd, setOnAdd] = useState(null);
  const [today, setToday] = useState(null);
  const [editRowData, setEditRowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeState, dispatch] = useContext(StoreContext);

  const isMountedRef = useRef(true);

  const todayDate = () => {
    const today = new Date();
    const todayISO = today.toISOString().substr(0, 10);
    if (isMountedRef.current) {
      setToday(todayISO);
    }
  };

  // validace je dvojená v handleChangeRecord
  const validator = (validatorType, value, elementId) => {
    console.log(validatorType + " " + value + " " + elementId);
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
      if (isMountedRef.current) {
        const { recordUid } = onDelete.params;
        dispatch({ type: "DELETE_RECORD", payload: { recordUid } });
        firebaseService.deleteUserRecord(currentUser.uid, recordUid);
      }
    }
    if (onDelete.element === "row") {
      if (isMountedRef.current) {
        const { recordUid, recordRowUid } = onDelete.params;
        dispatch({
          type: "DELETE_RECORD_ROW",
          payload: { recordUid, recordRowUid },
        });
        firebaseService.deleteUserRecordRow(
          currentUser.uid,
          recordUid,
          recordRowUid
        );
      }
    }
  };

  const doCreateRecordAndRefresh = () => {
    const id = Date.now();
    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserRecord(currentUser.uid));
      reject(new Error("Currently unavaiable create record"));
    })
      .then(() => {
        if (isMountedRef.current) {
          dispatch({ type: "ADD_RECORD", payload: { id } });
        }
      })
      .catch((err) => {
        if (isMountedRef) {
          alert(err);
        }
      });
  };

  const handleChangeRecordName = (userUid, recordUid, newRecordName) => {
    const updatedRecord = {
      ...storeState.records[recordUid],
      name: newRecordName,
    };

    if (isMountedRef.current) {
      dispatch({
        type: "EDIT_RECORD_NAME",
        payload: { recordUid, updatedRecord },
      });
      firebaseService.setUserRecord(userUid, recordUid, updatedRecord);
    }
  };

  const editRow = (recordUid, rowUid, rowValue) => {
    if (isMountedRef.current) {
      setEditRowData({ recordUid, rowUid, rowValue });
    }

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

    let updatedRecord = {
      ...storeState.records[editRowData.recordUid],
      data: {
        ...storeState.records[editRowData.recordUid].data,
        [editRowData.rowUid]: updatedRow,
      },
    };

    if (isMountedRef.current) {
      dispatch({
        type: "EDIT_RECORD_ROW",
        payload: { recordUid: editRowData.recordUid, updatedRecord },
      });

      firebaseService.setUserRecord(
        currentUser.uid,
        editRowData.recordUid,
        updatedRecord
      );

      setEditRowData(null);
    }
  };

  const editRecordName = (key) => {
    const elName = document.getElementById(`${key}-recordName`);
    elName.disabled = !elName.disabled;
  };

  const addRowAndRefresh = (recordUid, props) => {
    if (isMountedRef.current) {
      const rowId = Date.now();
      firebaseService.createUserRecordRow(
        currentUser.uid,
        recordUid,
        props,
        rowId
      );
      dispatch({
        type: "ADD_RECORD_ROW",
        payload: { recordUid, rowId, props },
      });
    }
  };

  const updateData = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(true);
    }

    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => {
        if (isMountedRef.current) {
          dispatch({ type: "ADD_RECORDS", payload: { ...records } });
          setLoading(false);
        }
      });
  }, [currentUser, dispatch]);

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
    if (isMountedRef.current) {
      setOnDelete({
        element,
        params,
        text,
      });
    }
  };

  const handleSubmitAdd = async (event) => {
    if (isMountedRef.current) {
      setEditRowData(null);
    }

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
  };

  const handleAddClose = () => {
    if (isMountedRef.current) {
      setEditRowData(null);
      setShowModalAdd(false);
    }
  };

  const handleAddShow = () => setShowModalAdd(true);

  const handleAdd = (recordKey) => {
    handleAddShow();
    if (isMountedRef.current) {
      setOnAdd(recordKey);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    localStorage.setItem("lastLocation", "/record");
    todayDate();

    if (!storeState.records) {
      updateData();
    }

    return () => (isMountedRef.current = false);
  }, [storeState.records, updateData]);

  return (
    <>
      <div className="record-page_main">
        <Button
          variant="success"
          className="record-page_float-btn"
          onClick={doCreateRecordAndRefresh}
        >
          <img src="/plus.svg" alt="" width="30px" height="30px"></img>
        </Button>
        <br />
        {loading && <Spinner animation="border" variant="success" />}
        {!!storeState.records &&
          Object.entries(storeState.records).length === 0 && (
            <p>No records... Add some :-)</p>
          )}
        <div className="record-page_records">
          {!!storeState.records &&
            !!Object.entries(storeState.records).length &&
            Object.entries(storeState.records).map(([recordKey, value]) => (
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
                    id={`input-group-dropdown-${recordKey}`}
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

                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Actions</th>
                      <th>Notes</th>
                      <th>Date</th>
                      <th>District</th>
                      <th>Subdistrict</th>
                      <th>Kind</th>
                      <th>Ks</th>
                      <th>Kg</th>
                      <th>Cm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.records &&
                      storeState.records[recordKey] &&
                      storeState.records[recordKey].data &&
                      Object.entries(storeState.records[recordKey].data).map(
                        ([rowKey, value]) => (
                          <tr key={rowKey}>
                            <td className="record-page_action-btns">
                              <img
                                src="/edit.svg"
                                alt="edit"
                                width="15px"
                                height="15px"
                                style={{ margin: "0px 8px" }}
                                onClick={() =>
                                  editRow(recordKey, rowKey, value)
                                }
                              ></img>
                              <img
                                src="/delete.svg"
                                alt="delete"
                                width="16px"
                                height="16px"
                                style={{ margin: "0px 8px" }}
                                onClick={() =>
                                  handleDelete("row", {
                                    recordUid: recordKey,
                                    recordRowUid: rowKey,
                                  })
                                }
                              ></img>
                            </td>

                            <td className="record-page_action-btns">
                              {!!!value.kind ||
                              !!!value.pieces ||
                              !!!value.kilograms ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-disabled">
                                      Chybějící povinná data: druh ryby, váha
                                      nebo počet kusů
                                    </Tooltip>
                                  }
                                >
                                  <span className="d-inline-block record-page_note">
                                    <img
                                      src="/exclamation-red.svg"
                                      alt="exclamation"
                                      width="16px"
                                      height="16px"
                                    ></img>
                                  </span>
                                </OverlayTrigger>
                              ) : (
                                ""
                              )}
                              {!!!value.centimeters ||
                              !fishKind.some((f) => f === value.kind) ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-disabled">
                                      Chybějící data: centimetry. Nebo tento
                                      druh spadá do kategorie Ostatní
                                    </Tooltip>
                                  }
                                >
                                  <span className="d-inline-block record-page_note">
                                    <img
                                      src="/exclamation-blue.svg"
                                      alt="exclamation"
                                      width="16px"
                                      height="16px"
                                    ></img>
                                  </span>
                                </OverlayTrigger>
                              ) : (
                                ""
                              )}
                              {value.kind &&
                              value.pieces &&
                              value.kilograms &&
                              value.centimeters &&
                              fishKind.some((f) => f === value.kind) ? (
                                <span className="record-page_note-empty">
                                  -
                                </span>
                              ) : (
                                ""
                              )}
                            </td>

                            <td className="record-page_date">
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

                            <td className="record-page_kind">
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
              </div>
            ))}
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
            <Button variant="outline-danger" onClick={handleCloseAndDelete}>
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
              onSubmit={!!editRowData ? handleSubmitChange : handleSubmitAdd}
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
                  id={`${onAdd}form-districtNumber`}
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.districtNumber : ""
                  }
                  onChange={(e) =>
                    validator(
                      "validateDistrictNumber",
                      e.target.value,
                      `${onAdd}form-districtNumber`
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
                  id={`${onAdd}form-subdistrictNumber`}
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.subdistrictNumber : ""
                  }
                  onChange={(e) =>
                    validator(
                      "validateNoDigits",
                      e.target.value,
                      `${onAdd}form-subdistrictNumber`
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
                  id={`${onAdd}form-kind`}
                  autoComplete="off"
                  defaultValue={!!editRowData ? editRowData.rowValue.kind : ""}
                  onChange={() => autocompleterService.do(`${onAdd}form-kind`)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Pieces</Form.Label>
                <Form.Control
                  type="number"
                  name="pieces"
                  id={`${onAdd}form-pieces`}
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.pieces : ""
                  }
                  onChange={(e) =>
                    validator(
                      "validateNoDigits",
                      e.target.value,
                      `${onAdd}form-pieces`
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
                  id={`${onAdd}form-kilograms`}
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.kilograms : ""
                  }
                  onChange={(e) =>
                    validator(
                      "validate2Digits",
                      e.target.value,
                      `${onAdd}form-kilograms`
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
                  id={`${onAdd}form-centimeters`}
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.centimeters : ""
                  }
                  onChange={(e) =>
                    validator(
                      "validate2Digits",
                      e.target.value,
                      `${onAdd}form-centimeters`
                    )
                  }
                />
              </Form.Group>

              <Button variant="success" type="submit">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default RecordPage;
