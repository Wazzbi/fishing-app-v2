import React, { useEffect, useState, useContext } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";
import "./summaryPage.scss";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";

// TODO zobrazovat seznam summary
// TODO poslat vybraný summary do mailu
// TODO rename udělat jako focus na input a zrušit tlačítko
// TODO řazení nejnovější nahoře
// TODO records, summaries zabraný -> přejmenovat
// TODO zablokovat SEND když budou nějaká nevalidní data
// TODO sloupce s rybama přes loop
// !! řazení je ve stylech od nejnovějšího k nejstaršího

const SummaryPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState(null);
  const [summaries, setSummaries] = useState(null);
  const [showModalAddSummary, setShowModalAddSummary] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [onDelete, setOnDelete] = useState(null);
  const [recordsTogether, setRecordsTogether] = useState(null);
  const [noSummaryYet, setNoSummaryYet] = useState(false);

  const prepareData = (records, summaries) => {
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
            .map(([recordKey, recoredValue]) => {
              // získej čistá data rows
              Object.entries(recoredValue.data).map(([rowKey, rowValue]) =>
                recordsArray.push(rowValue)
              );
            });

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
            const previousFishes = previousDistrict && previousDistrict.fishes;
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
                    [row.kind.toLowerCase() || "none"]: {
                      ...previousKind,
                      pieces: (previousPieces || 0) + +row.pieces,
                      kilograms: (previousKilograms || 0) + +row.kilograms,
                    },
                  },
                },
              },
            };
          });
        } else {
          // setovat k summary prázdný pole records pokud nejsou data
          console.log(`${index}: `, "summary nemá records");
        }
      });
    }

    if (!!finalData) {
      setRecordsTogether({
        // ...recordsTogether,
        ...finalData,
      });
    }
  };

  const handleCloseModalAddSummary = () => setShowModalAddSummary(false);
  const handleShowModalChangeSummary = (summaryUid) => {
    setSelectedSummary(summaryUid);
    setSelectedRecords(
      summaries && summaries[summaryUid] && summaries[summaryUid].records
        ? summaries[summaryUid].records
        : []
    );
    setShowModalAddSummary(true);
  };

  const updateData = () => {
    // protože je useState async dotahuji data přes proměnné...
    let updateRecords, updateSummaries;
    new Promise((resolve, reject) => {
      resolve(firebaseService.getUserRecords(currentUser && currentUser.uid));
      reject(new Error("Nemohu načíst záznamy uživatele"));
    })
      .then((records) => {
        updateRecords = records;
        records ? setRecords(records) : setRecords(null);
      })
      .then(() => {
        new Promise((resolve, reject) => {
          resolve(
            firebaseService.getUserSummaries(currentUser && currentUser.uid)
          );
          reject(new Error("Nemohu načíst souhrny uživatele"));
        })
          .then((summaries) => {
            updateSummaries = summaries;
            return summaries
              ? setSummaries(summaries)
              : (setSummaries(null), setNoSummaryYet(true));
          })
          .then(() => {
            prepareData(updateRecords, updateSummaries);
          });
      });
  };

  const handleSubmitChange = () => {
    handleChangeRecords(currentUser.uid, selectedSummary, selectedRecords);
    setSelectedRecords([]);
    handleCloseModalAddSummary();
  };

  const changeRecordInSummary = (recordId) => {
    setSelectedRecords((oldArray) =>
      oldArray.includes(recordId)
        ? oldArray.filter((el) => el !== recordId)
        : [...oldArray, recordId]
    );
  };

  const doCreateSummaryAndRefresh = () => {
    setNoSummaryYet(false);
    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserSummary(currentUser.uid));
      reject(new Error("Currently unavaiable create summary"));
    })
      .then(() => {
        firebaseService
          .getUserSummaries(currentUser && currentUser.uid)
          .then((freshSummaries) =>
            freshSummaries
              ? setSummaries(freshSummaries)
              : (setSummaries(null), setNoSummaryYet(true))
          );
      })
      .catch(alert);
  };

  const handleChangeSummaryName = (userUid, summaryUid, newSummaryName) => {
    setSummaries({
      ...summaries,
      [summaryUid]: { ...summaries[summaryUid], name: newSummaryName },
    });

    const updatedSummary = {
      ...summaries[summaryUid],
      name: newSummaryName,
    };
    firebaseService.setUserSummary(userUid, summaryUid, updatedSummary);
  };

  const handleChangeRecords = (userUid, summaryUid, changeRecords) => {
    setSummaries({
      ...summaries,
      [summaryUid]: { ...summaries[summaryUid], records: [...changeRecords] },
    });

    const updatedSummary = {
      ...summaries[summaryUid],
      records: [...changeRecords],
    };

    prepareData(records, {
      ...summaries,
      [summaryUid]: { ...summaries[summaryUid], records: [...changeRecords] },
    });
    firebaseService.setUserSummary(userUid, summaryUid, updatedSummary);
  };

  const editSummaryName = (key) => {
    const elName = document.getElementById(`${key}-summaryName`);
    elName.disabled = !elName.disabled;
  };

  const handleDelete = (params) => {
    const text = "Chcete opravdu smazat tento Souhrn ?";
    handleDeleteShow();
    setOnDelete({
      params,
      text,
    });
  };
  const handleCloseAndDelete = () => {
    setShowModalDelete(false);
    doDelete();
  };
  const handleDeleteClose = () => setShowModalDelete(false);
  const handleDeleteShow = () => setShowModalDelete(true);

  const doDelete = () => {
    const { summaryUid } = onDelete.params;

    new Promise((resolve, reject) => {
      resolve(firebaseService.deleteUserSummary(currentUser.uid, summaryUid));
      reject(new Error("Nemohu nahrát záznamy uživatele"));
    }).then(() => updateData());
  };

  const isChecked = (recordKey) => {
    if (
      !!summaries &&
      summaries[selectedSummary] &&
      summaries[selectedSummary].records &&
      summaries[selectedSummary].records.length !== 0
    ) {
      return summaries[selectedSummary].records.includes(recordKey);
    } else {
      return false;
    }
  };

  useEffect(() => {
    updateData();
  }, []);

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

        {summaries === null && !noSummaryYet && (
          <Spinner animation="border" variant="primary" />
        )}
        {noSummaryYet && <p>Add some summary dude!</p>}

        <div className="summary-page_summaries">
          {!!summaries &&
            Object.entries(summaries).map(([summaryKey, value]) => (
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
                      add records
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
                      <th colSpan="2">1 Kapr</th>
                      <th colSpan="2">2 Okoun</th>
                      <th colSpan="2">3 Candát</th>
                      <th rowSpan="2">Počet docházek</th>
                    </tr>
                    <tr>
                      <th>Číslo</th>
                      <th>Název</th>
                      <th>Ks</th>
                      <th>Kg</th>
                      <th>Ks</th>
                      <th>Kg</th>
                      <th>Ks</th>
                      <th>Kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!!recordsTogether &&
                      !!recordsTogether[summaryKey] &&
                      Object.entries(recordsTogether[summaryKey]).map(
                        ([rowDataKey, rowDataValue]) => (
                          <tr>
                            <td>
                              {rowDataValue.districtNumber}{" "}
                              <span
                                title="chybějící povinná data: druh ryby, váha nebo počet kusů"
                                style={{
                                  color: "red",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                              >
                                {rowDataValue.alertMissingData.some(
                                  (a) => a === true
                                )
                                  ? "(!)"
                                  : ""}
                              </span>
                            </td>
                            <td> </td>
                            <td>
                              {rowDataValue.subdistrictNumber
                                ? rowDataValue.subdistrictNumber
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.kapr &&
                              rowDataValue.fishes.kapr.pieces
                                ? rowDataValue.fishes.kapr.pieces
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.kapr &&
                              rowDataValue.fishes.kapr.kilograms
                                ? rowDataValue.fishes.kapr.kilograms
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.okoun &&
                              rowDataValue.fishes.okoun.pieces
                                ? rowDataValue.fishes.okoun.pieces
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.okoun &&
                              rowDataValue.fishes.okoun.kilograms
                                ? rowDataValue.fishes.okoun.kilograms
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.candat &&
                              rowDataValue.fishes.candat.pieces
                                ? rowDataValue.fishes.candat.pieces
                                : "-"}
                            </td>
                            <td>
                              {rowDataValue &&
                              rowDataValue.fishes &&
                              rowDataValue.fishes.candat &&
                              rowDataValue.fishes.candat.kilograms
                                ? rowDataValue.fishes.candat.kilograms
                                : "-"}
                            </td>
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
              {!!records &&
                Object.entries(records).map(([recordKey, value]) => (
                  <Form.Check
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
