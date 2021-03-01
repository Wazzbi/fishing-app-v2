import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import { AuthContext } from "../../Auth";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

// ? TODO načíst records
// TODO možnost slučovat records do jednoho summary
// TODO zobrazovat seznam summary
// TODO poslat vybraný summary do mailu
// ? TODO v summary data readonly
// TODO nějaký grafy
// TODO rename udělat jako focus na input a zrušit tlačítko
// TODOD řazení nejnovější nahoře

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

  // ! toto má setovat *setRecordsTogether*
  // ! má to být objekt summaries kde má každý sečtený records
  const summariesData = () => {
    if (!!summaries && !!records) {
      Object.entries(summaries).map(([summaryKey, summaryValue], index) => {
        // získej pole records z summary
        const { records: summaryRecords } = summaryValue;

        if (!!summaryRecords) {
          // získej dané records
          const targetRecords = Object.entries(records)
            .filter(([recordKey, recordValue]) =>
              summaryRecords.includes(recordKey)
            )
            .map(([recordKey, recoredValue]) => recoredValue.data);
          // slouči hodnoty v každém record a pak sloučit records
          console.log(`${index}: `, targetRecords);
        } else {
          // setovat k summary prázdný pole records pokud nejsou data
          console.log(`${index}: `, "summary nemá records");
        }
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
    firebaseService
      .getUserRecords(currentUser && currentUser.uid)
      .then((records) => (records ? setRecords(records) : setRecords(null)));
    firebaseService
      .getUserSummaries(currentUser && currentUser.uid)
      .then((summaries) =>
        summaries ? setSummaries(summaries) : setSummaries(null)
      );
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
    new Promise((resolve, reject) => {
      resolve(firebaseService.createUserSummary(currentUser.uid));
      reject(new Error("Currently unavaiable create summary"));
    })
      .then(() => {
        firebaseService
          .getUserSummaries(currentUser && currentUser.uid)
          .then((summaries) =>
            summaries ? setSummaries(summaries) : setSummaries(null)
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

  const handleChangeRecords = (userUid, summaryUid, records) => {
    setSummaries({
      ...summaries,
      [summaryUid]: { ...summaries[summaryUid], records: [...records] },
    });

    const updatedSummary = {
      ...summaries[summaryUid],
      records: [...records],
    };
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
    firebaseService.deleteUserSummary(currentUser.uid, summaryUid);

    updateData();
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
      <h1>SummaryPage</h1>
      <button onClick={doCreateSummaryAndRefresh}>Add summary card</button>
      <br />
      <br />

      {!summaries && <p>Add some summarry dude!</p>}

      {!!summaries &&
        Object.entries(summaries).map(([summaryKey, value]) => (
          <div key={summaryKey}>
            <input
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
            />{" "}
            <button onClick={() => editSummaryName(summaryKey)}>rename</button>{" "}
            <button onClick={() => handleShowModalChangeSummary(summaryKey)}>
              records
            </button>{" "}
            <button onClick={() => handleDelete({ summaryUid: summaryKey })}>
              delete
            </button>{" "}
            <button>send</button>
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>prop#1</th>
                  <th>prop#2</th>
                </tr>
              </thead>
              <tbody>
                {
                  !!summaries && !!records && summariesData()
                  // false &&
                  //   records[summaryKey] &&
                  //   records[summaryKey].data &&
                  //   Object.entries(records[summaryKey].data).map(
                  //     ([rowKey, value]) => (
                  //       <tr>
                  //         {/** prop${index} přes index procházet číselník a použít normální názvy !!!index start 1*/}
                  //         {Object.entries(value).map(
                  //           ([propKey, value], index) => (
                  //             <td>{value ? value : ""}</td>
                  //           )
                  //         )}
                  //       </tr>
                  //     )
                  //   )
                }
              </tbody>
            </Table>
            <br />
            <br />
          </div>
        ))}

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
    </>
  );
};

export default SummaryPage;
