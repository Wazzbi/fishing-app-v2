import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";
import "./summaryPage.scss";
import { StoreContext } from "../../store/Store";
import { fishKind } from "../../constants";

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

// TODO zobrazovat seznam summary
// TODO poslat vybraný summary do mailu
// TODO rename udělat jako focus na input a zrušit tlačítko
// TODO records, summaries zabraný -> přejmenovat
// TODO zablokovat SEND když budou nějaká nevalidní data
// TODO sloupce s rybama přes loop
// !! řazení je ve stylech od nejnovějšího k nejstaršího

const SummaryPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [showModalAddSummary, setShowModalAddSummary] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [onDelete, setOnDelete] = useState(null);
  const [recordsTogether, setRecordsTogether] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeState, dispatch] = useContext(StoreContext);

  const isMountedRef = useRef(true);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const prepareData = useCallback(
    (records, summaries) => {
      let finalData = {};

      if (!!records && !!summaries) {
        Object.entries(summaries).map(([summaryKey, summaryValue], index) => {
          // získej pole records z summary
          const { records: summaryRecords } = summaryValue;

          if (!!summaryRecords) {
            let recordsArray = [];
            // získej dané records pro každý summary
            Object.entries(records)
              .filter(([recordKey, recordValue]) =>
                summaryRecords.includes(recordKey)
              )
              .map(([recordKey, recoredValue]) =>
                // získej čistá data rows
                Object.entries(recoredValue.data).map(([rowKey, rowValue]) =>
                  recordsArray.push(rowValue)
                )
              );

            recordsArray.map((row, index) => {
              let alertMissingData = false;

              const visitedCounter =
                finalData &&
                finalData[summaryKey] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].visited
                  ? finalData[summaryKey][
                      `${row.districtNumber}-${row.subdistrictNumber || 0}`
                    ].visited + 1
                  : 1;

              const previousData = finalData && finalData[summaryKey];
              const previousDistrict =
                previousData &&
                previousData[
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ];
              const previousDistrictAlert =
                previousDistrict && previousDistrict.alertMissingData
                  ? previousDistrict.alertMissingData
                  : [];
              const previousFishes =
                previousDistrict && previousDistrict.fishes;
              const previousKind = previousFishes && previousFishes[row.kind];
              const previousPieces = previousKind && previousKind.pieces;
              const previousKilograms = previousKind && previousKind.kilograms;

              if (!!!row.kind && !!!row.kilograms && !!!row.pieces) {
                alertMissingData = false;
              } else if (!!!row.kind || !!!row.kilograms || !!!row.pieces) {
                alertMissingData = true;
              }

              finalData = {
                ...finalData,
                [summaryKey]: {
                  ...previousData,
                  [`${row.districtNumber}-${row.subdistrictNumber || 0}`]: {
                    ...previousDistrict,
                    districtNumber: row.districtNumber,
                    subdistrictNumber: row.subdistrictNumber || 0,
                    visited: visitedCounter,
                    alertMissingData: [
                      ...previousDistrictAlert,
                      alertMissingData,
                    ],
                    fishes: {
                      ...previousFishes,
                      [fishKind.some(
                        (f) => f === capitalizeFirstLetter(row.kind)
                      )
                        ? row.kind.toLowerCase()
                        : "ostatní"]: {
                        ...previousKind,
                        pieces: (previousPieces || 0) + +row.pieces,
                        kilograms: (previousKilograms || 0) + +row.kilograms,
                      },
                    },
                  },
                },
              };
              if (isMountedRef.current) {
                setRecordsTogether({
                  ...recordsTogether,
                  ...finalData,
                });
              }
              return null;
            });
          } else {
            // setovat k summary prázdný pole records pokud nejsou data
            console.log(`${index}: `, "summary nemá records");
            return null;
          }
          return null;
        });
      }
    },
    [recordsTogether]
  );

  const handleCloseModalAddSummary = () => setShowModalAddSummary(false);
  const handleShowModalChangeSummary = (summaryUid) => {
    if (isMountedRef.current) {
      setSelectedSummary(summaryUid);
      setSelectedRecords(
        storeState.summaries &&
          storeState.summaries[summaryUid] &&
          storeState.summaries[summaryUid].records
          ? storeState.summaries[summaryUid].records
          : []
      );
      setShowModalAddSummary(true);
    }
  };

  const updateData = useCallback(() => {
    // protože je useState async dotahuji data přes proměnné...
    let updateRecords, updateSummaries;
    setLoading(true);
    new Promise((resolve, reject) => {
      resolve(firebaseService.getUserRecords(currentUser && currentUser.uid));
      reject(new Error("Nemohu načíst záznamy uživatele"));
    })
      .then((records) => {
        if (isMountedRef.current) {
          updateRecords = records;
          dispatch({ type: "ADD_RECORDS", payload: { ...records } });
        }
      })
      .then(() => {
        new Promise((resolve, reject) => {
          resolve(
            firebaseService.getUserSummaries(currentUser && currentUser.uid)
          );
          reject(new Error("Nemohu načíst souhrny uživatele"));
        })
          .then((summaries) => {
            if (isMountedRef.current) {
              updateSummaries = summaries;
              dispatch({ type: "ADD_SUMMARIES", payload: { ...summaries } });
            }
          })
          .then(() => {
            if (isMountedRef.current) {
              setLoading(false);
              prepareData(updateRecords, updateSummaries);
            }
          });
      });
  }, [currentUser, dispatch, prepareData]);

  const handleSubmitChange = () => {
    handleChangeRecords(currentUser.uid, selectedSummary, selectedRecords);

    handleCloseModalAddSummary();

    if (isMountedRef.current) {
      setSelectedRecords([]);
    }
  };

  const changeRecordInSummary = (recordId) => {
    if (isMountedRef.current) {
      setSelectedRecords((oldArray) =>
        oldArray.includes(recordId)
          ? oldArray.filter((el) => el !== recordId)
          : [...oldArray, recordId]
      );
    }
  };

  const doCreateSummaryAndRefresh = () => {
    const id = Date.now();
    setLoading(false);
    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserSummary(currentUser.uid, id));
      reject(new Error("Currently unavaiable create summary"));
    })
      .then(() => {
        if (isMountedRef.current) {
          dispatch({ type: "ADD_SUMMARY", payload: { id } });
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          alert(err);
        }
      });
  };

  const handleChangeSummaryName = (userUid, summaryUid, newSummaryName) => {
    if (isMountedRef.current) {
      const updatedSummary = {
        ...storeState.summaries[summaryUid],
        name: newSummaryName,
      };
      dispatch({
        type: "EDIT_SUMMARY",
        payload: { summaryUid, updatedSummary },
      });
      firebaseService.setUserSummary(userUid, summaryUid, updatedSummary);
    }
  };

  const handleChangeRecords = (userUid, summaryUid, changeRecords) => {
    if (isMountedRef.current) {
      const updatedSummary = {
        ...storeState.summaries[summaryUid],
        records: [...changeRecords],
      };

      prepareData(storeState.records, {
        ...storeState.summaries,
        [summaryUid]: {
          ...storeState.summaries[summaryUid],
          records: [...changeRecords],
        },
      });
      dispatch({
        type: "EDIT_SUMMARY",
        payload: { summaryUid, updatedSummary },
      });
      firebaseService.setUserSummary(userUid, summaryUid, updatedSummary);
    }
  };

  const editSummaryName = (key) => {
    const elName = document.getElementById(`${key}-summaryName`);
    elName.disabled = !elName.disabled;
  };

  const handleDelete = (params) => {
    if (isMountedRef.current) {
      const text = "Chcete opravdu smazat tento Souhrn ?";
      handleDeleteShow();
      setOnDelete({
        params,
        text,
      });
    }
  };
  const handleCloseAndDelete = () => {
    if (isMountedRef.current) {
      setShowModalDelete(false);
      doDelete();
    }
  };
  const handleDeleteClose = () => setShowModalDelete(false);
  const handleDeleteShow = () => setShowModalDelete(true);

  const doDelete = () => {
    if (isMountedRef.current) {
      const { summaryUid } = onDelete.params;

      firebaseService.deleteUserSummary(currentUser.uid, summaryUid);
      dispatch({ type: "DELETE_SUMMARY", payload: { summaryUid } });
    }
  };

  const isChecked = (recordKey) => {
    if (
      !!storeState.summaries &&
      storeState.summaries[selectedSummary] &&
      storeState.summaries[selectedSummary].records &&
      storeState.summaries[selectedSummary].records.length !== 0
    ) {
      return storeState.summaries[selectedSummary].records.includes(recordKey);
    } else {
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    localStorage.setItem("lastLocation", "/summary");

    if (!storeState.summaries || !storeState.records) {
      updateData();
    }
    //  else {
    //   // !! infinite loop -> refactoring needed
    //   prepareData(storeState.records, storeState.summaries);
    // }

    return () => (isMountedRef.current = false);
  }, [storeState.records, storeState.summaries, updateData]);

  useEffect(() => {
    prepareData(storeState.records, storeState.summaries);

    // error v konzoly vede k CPU issue když se přidá dependence na prepareData
    return prepareData(storeState.records, storeState.summaries);
  }, [storeState.records, storeState.summaries]);

  return (
    <>
      <div className="summary-page_main">
        <Button
          variant="primary"
          className="summary-page-add-btn"
          onClick={doCreateSummaryAndRefresh}
        >
          Add summary card
        </Button>

        <br />
        <br />

        {loading && <Spinner animation="border" variant="primary" />}
        {!!storeState.summaries &&
          Object.entries(storeState.summaries).length === 0 && (
            <p>Add some summary dude!</p>
          )}

        <div className="summary-page_summaries">
          {!!storeState.summaries &&
            !!Object.entries(storeState.summaries).length &&
            Object.entries(storeState.summaries).map(([summaryKey, value]) => (
              <div key={summaryKey} className="summary-page_table">
                <InputGroup className="summary-page_record-name">
                  <FormControl
                    id={`${summaryKey}-summaryName`}
                    name="summaryName"
                    type="text"
                    placeholder="Summary Name"
                    onChange={(e) =>
                      handleChangeSummaryName(
                        currentUser.uid,
                        summaryKey,
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
                    id={`input-group-dropdown-${summaryKey}`}
                  >
                    <Dropdown.Item onClick={() => editSummaryName(summaryKey)}>
                      rename
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleShowModalChangeSummary(summaryKey)}
                    >
                      select records
                    </Dropdown.Item>
                    <Dropdown.Item>send</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      className="summary-page_delete-text"
                      onClick={() => handleDelete({ summaryUid: summaryKey })}
                    >
                      delete
                    </Dropdown.Item>
                  </DropdownButton>
                </InputGroup>

                <Table responsive bordered hover size="sm">
                  <thead>
                    <tr>
                      <th colSpan="2">Revír</th>
                      <th rowSpan="2">Číslo podrevíru</th>
                      {fishKind.map((fish, index) => (
                        <th colSpan="2" key={`fish-kind-${index}`}>{`${
                          index + 1
                        } ${fish}`}</th>
                      ))}
                      <th rowSpan="2">Počet docházek</th>
                    </tr>
                    <tr>
                      <th>Číslo</th>
                      <th>Název</th>
                      {fishKind.map((f, index) => {
                        return [
                          <th key={`fish-ks-${index}`}>Ks</th>,
                          <th key={`fish-kg-${index}`}>Kg</th>,
                        ];
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {!!recordsTogether &&
                      !!recordsTogether[summaryKey] &&
                      Object.entries(recordsTogether[summaryKey]).map(
                        ([rowDataKey, rowDataValue]) => (
                          <tr key={rowDataKey}>
                            <td className="summary-page_number-a-action">
                              {rowDataValue.districtNumber}{" "}
                              {rowDataValue.alertMissingData.some(
                                (a) => a === true
                              ) ? (
                                <OverlayTrigger
                                  trigger="click"
                                  placement="right"
                                  overlay={
                                    <Tooltip id="tooltip-disabled">
                                      chybějící povinná data: druh ryby, váha
                                      nebo počet kusů
                                    </Tooltip>
                                  }
                                >
                                  <span className="d-inline-block">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="summary-page_row-btn"
                                      style={{ pointerEvents: "none" }}
                                    >
                                      <img
                                        src="/exclamation.svg"
                                        alt="exclamation"
                                        width="15px"
                                        height="15px"
                                      ></img>
                                    </Button>
                                  </span>
                                </OverlayTrigger>
                              ) : (
                                ""
                              )}
                            </td>
                            <td> </td>
                            <td>
                              {rowDataValue.subdistrictNumber
                                ? rowDataValue.subdistrictNumber
                                : "-"}
                            </td>
                            {fishKind.map((fish, index) => {
                              return [
                                <td key={`fish-td-1-${index}`}>
                                  {rowDataValue &&
                                  rowDataValue.fishes &&
                                  rowDataValue.fishes[fish.toLowerCase()] &&
                                  rowDataValue.fishes[fish.toLowerCase()].pieces
                                    ? rowDataValue.fishes[fish.toLowerCase()]
                                        .pieces
                                    : "-"}
                                </td>,
                                <td key={`fish-td-2-${index}`}>
                                  {rowDataValue &&
                                  rowDataValue.fishes &&
                                  rowDataValue.fishes[fish.toLowerCase()] &&
                                  rowDataValue.fishes[fish.toLowerCase()]
                                    .kilograms
                                    ? rowDataValue.fishes[fish.toLowerCase()]
                                        .kilograms
                                    : "-"}
                                </td>,
                              ];
                            })}

                            <td>{rowDataValue.visited}</td>
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
            <Button variant="primary" onClick={handleCloseAndDelete}>
              DELETE
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showModalAddSummary}
          onHide={handleCloseModalAddSummary}
          backdrop="static"
          keyboard={false}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Vyberte zápisy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitChange}>
              {!!storeState.records &&
                Object.entries(storeState.records).map(([recordKey, value]) => (
                  <Form.Check
                    key={recordKey}
                    type="checkbox"
                    id={recordKey}
                    label={value && value.name ? value.name : "No name!"}
                    defaultChecked={isChecked(recordKey)}
                    onChange={() => changeRecordInSummary(recordKey)}
                  />
                ))}
              <Button
                variant="primary"
                type="submit"
                disabled={selectedRecords && selectedRecords.length === 0}
              >
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default SummaryPage;
