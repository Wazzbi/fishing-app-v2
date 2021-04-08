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
// TODO udělat sekci pro staré recordy

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
  const [actualYearRecord, setActualYearRecord] = useState(null);
  const [actualYear, setActualYear] = useState(2021);

  const isMountedRef = useRef(true);

  const todayDate = () => {
    const today = new Date();
    const todayISO = today.toISOString().substr(0, 10);
    if (isMountedRef.current) {
      setToday(todayISO);
    }
  };

  const handleActualYear = (year) => {
    setActualYear(+year);
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
    let _recordName = new Date();
    let recordId = _recordName.getFullYear();

    if (isMountedRef.current) {
      dispatch({ type: "ADD_RECORD", payload: { recordId } });
    }

    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserRecord(currentUser.uid, recordId));
      reject(new Error("Currently unavaiable create record"));
    }).catch((err) => {
      if (isMountedRef) {
        alert(err);
      }
      // bez kondice zdali je view snažit se data uložit
      // TODO předělat rekurzivně
      firebaseService.createUserRecord(currentUser.uid, recordId);
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
      kind: capitalizeFirstLetter(kind.value),
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

  // získej z DB record aktuálního roku nebo ho vytvoř
  const updateData = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(true);
    }

    const uid = currentUser && currentUser.uid;
    let _recordName = new Date();
    let recordName = _recordName.getFullYear();

    firebaseService.getUserRecord(uid, recordName).then((record) => {
      if (isMountedRef.current) {
        console.log(record);
        if (!record) {
          // když není nalezen záznam aktuálního roku -> vytroř ho
          doCreateRecordAndRefresh();
        } else {
          // pokud záznam existuje -> jen ho ulož do store
          dispatch({
            type: "ADD_RECORD",
            // setovaní recordId kvůli úplně novým tabulkám viz doCreateRecordAndRefresh a row 357 **onClick={() => handleAdd(actualYearRecord.recordId)}**
            payload: { recordId: record.name, ...record },
          });
        }

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
      kind: capitalizeFirstLetter(kind.value),
      pieces: pieces.value,
      kilograms: kilograms.value,
      centimeters: centimeters.value,
    });
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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
    let _currentYear = new Date();
    let currentYear = _currentYear.getFullYear();
    setActualYearRecord(currentYear);
    window.scrollTo(0, 0);

    if (!storeState.records) {
      updateData();
    }

    return () => (isMountedRef.current = false);
  }, [storeState.records, updateData]);

  return (
    <>
      <div className="record-page_main">
        <h3 className="record-page_page-title">Záznamy docházky a úlovků</h3>
        <div>
          <div className="record-page_history-wrapper">
            {[2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
              <button
                className={
                  actualYear === year
                    ? "record-page_history activeYear"
                    : "record-page_history"
                }
                onClick={() => handleActualYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="primary"
          className="record-page_float-btn"
          onClick={() => handleAdd(actualYearRecord)}
        >
          <img src="/plus.svg" alt="" width="30px" height="30px"></img>
        </Button>
        {loading && <Spinner animation="border" variant="success" />}
        {!!storeState.records &&
          Object.entries(storeState.records).length === 0 && (
            <span>Zatím nejsou žádné záznamy</span>
          )}
        <div className="record-page_records">
          {!!storeState.records &&
            !!Object.entries(storeState.records).length &&
            Object.entries(storeState.records).map(([recordKey, value]) => (
              <div key={recordKey} className="record-page_table">
                <div className="record-page_record-name">
                  <span className="record-page_title">
                    {value && value.recordId}
                  </span>

                  {/* <div className="record-page_icons">
                    <img
                      src="/delete.svg"
                      alt="delete"
                      width="16px"
                      height="16px"
                      style={{ margin: "0px 8px", cursor: "pointer" }}
                      onClick={() =>
                        handleDelete("record", { recordUid: recordKey })
                      }
                    ></img>
                  </div> */}
                </div>

                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Akce</th>
                      <th>Pozn.</th>
                      <th>Datum</th>
                      <th>Revír</th>
                      <th>Podrevír</th>
                      <th>Druh</th>
                      <th>Ks</th>
                      <th>Kg</th>
                      <th>Cm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.records &&
                      storeState.records[recordKey] &&
                      storeState.records[recordKey].data &&
                      Object.entries(storeState.records[recordKey].data)
                        .reverse()
                        .map(([rowKey, value]) => (
                          <tr key={rowKey}>
                            <td className="record-page_action-btns">
                              <img
                                src="/edit.svg"
                                alt="edit"
                                width="15px"
                                height="15px"
                                style={{ margin: "0px 8px", cursor: "pointer" }}
                                onClick={() =>
                                  editRow(recordKey, rowKey, value)
                                }
                              ></img>
                              <img
                                src="/delete.svg"
                                alt="delete"
                                width="16px"
                                height="16px"
                                style={{ margin: "0px 8px", cursor: "pointer" }}
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
                                {value.pieces ? value.pieces : "-"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`row-${rowKey}`}
                                id={`row-${rowKey}-kilograms`}
                              >
                                {value.kilograms ? value.kilograms : "-"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`row-${rowKey}`}
                                id={`row-${rowKey}-centimeters`}
                              >
                                {value.centimeters ? value.centimeters : "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
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
              Zavřít
            </Button>
            <Button variant="outline-danger" onClick={handleCloseAndDelete}>
              SMAZAT
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
                <Form.Label>Datum</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  defaultValue={
                    !!editRowData ? editRowData.rowValue.date : today
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Číslo Revíru</Form.Label>
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
              </Form.Group>

              <Form.Group>
                <Form.Label>Číslo Podrevíru</Form.Label>
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
                  Pokud podrevíru nemá číslo vyplňte nulu.
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Druh</Form.Label>
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
                <Form.Label>Kusů</Form.Label>
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
                <Form.Label>Váha (Kg)</Form.Label>
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
                <Form.Label>Délka (Cm)</Form.Label>
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
                Potvrdit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default RecordPage;
