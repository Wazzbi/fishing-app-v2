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
import jsPDF from "jspdf";
import "jspdf-autotable";

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
// TODO když nejsou v sloupci ryby žádný data tak sloupec nezobrazit
// TODO udělat sekci pro staré summary

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
  const [actualYear, setActualYear] = useState(2021);

  const isMountedRef = useRef(true);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleActualYear = (year) => {
    setActualYear(+year);
  };

  const prepareData = useCallback(
    (records, summaries) => {
      let finalData = {};

      if (!!records && !!summaries) {
        Object.entries(summaries).map(([summaryKey, summaryValue], index) => {
          // získej pole records z summary
          // const { records: summaryRecords } = summaryValue;

          if (true) {
            let recordsArray = [];
            // získej dané records pro každý summary
            Object.entries(records)
              // .filter(([recordKey, recordValue]) =>
              //   summaryRecords.includes(recordKey)
              // )
              .map(([recordKey, recordValue]) =>
                // získej čistá data rows
                {
                  if (recordValue && recordValue.data) {
                    Object.entries(recordValue.data).map(
                      ([rowKey, rowValue]) => {
                        if (rowValue) {
                          recordsArray.push(rowValue);
                        }
                      }
                    );
                  }
                }
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

              if (!!!row.kind && !!!row.kilograms && !!!row.pieces) {
                alertMissingData = false;
              } else if (!!!row.kind || !!!row.kilograms || !!!row.pieces) {
                alertMissingData = true;
              }

              const _fishKind = fishKind.some(
                (f) => f === capitalizeFirstLetter(row.kind)
              )
                ? row.kind.toLowerCase()
                : "ostatní";

              const _fishPieces =
                finalData &&
                finalData[summaryKey] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes[_fishKind] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes[_fishKind].pieces;

              const _fishKilograms =
                finalData &&
                finalData[summaryKey] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes[_fishKind] &&
                finalData[summaryKey][
                  `${row.districtNumber}-${row.subdistrictNumber || 0}`
                ].fishes[_fishKind].kilograms;

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
                      [_fishKind]: {
                        ...previousKind,
                        pieces: (_fishPieces || 0) + +row.pieces,
                        kilograms: (_fishKilograms || 0) + +row.kilograms,
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

  const updateData = useCallback(() => {
    // protože je useState async dotahuji data přes proměnné...
    let updateRecords, updateSummaries;
    const _currentUser = currentUser && currentUser.uid;
    let _currentYear = new Date();
    let currentYear = _currentYear.getFullYear();

    setLoading(true);
    new Promise((resolve, reject) => {
      // načti record aktuálního roku
      resolve(firebaseService.getUserRecord(_currentUser, currentYear));
      reject(new Error("Nemohu načíst záznamy uživatele"));
    })
      .then((record) => {
        if (isMountedRef.current) {
          if (record) {
            updateRecords = record;
            dispatch({ type: "ADD_RECORD", payload: { ...record } });
          } else {
            updateRecords = record;
            let _recordName = new Date();
            let recordId = _recordName.getFullYear();

            if (isMountedRef.current) {
              dispatch({ type: "ADD_RECORD", payload: { recordId } });
            }
          }
        }
      })
      .then(() => {
        new Promise((resolve, reject) => {
          resolve(firebaseService.getUserSummary(_currentUser, currentYear));
          reject(new Error("Nemohu načíst souhrny uživatele"));
        })
          .then((summary) => {
            if (isMountedRef.current) {
              if (summary) {
                updateSummaries = summary;
                dispatch({ type: "ADD_SUMMARY", payload: { ...summary } });
              } else {
                dispatch({
                  type: "ADD_SUMMARY",
                  payload: { summaryId: currentYear },
                });

                new Promise((resolve, reject) => {
                  resolve(
                    firebaseService.createUserSummary(_currentUser, currentYear)
                  );
                  reject(new Error("Currently unavaiable create summary"));
                }).catch((err) => {
                  if (isMountedRef.current) {
                    alert(err);
                  }
                  // bez ohledu jestli je ve view (mělo by být rekurzivně)
                  // TODO mělo by být rekurzivně
                  firebaseService.createUserSummary(_currentUser, currentYear);
                });
              }
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

  const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  // https://www.npmjs.com/package/jspdf-autotable
  const exportSummary = () => {
    // const newWindow = window.open();
    // const content = `<b>hello world</b><button class="hide" onclick="window.print();"> Print </button><style scoped>@media print{.hide {display:none}}</style>`;
    // newWindow.document.write(content);

    const doc = new jsPDF("l", "mm", "a4");

    // It can parse html:
    // <table id="my-table"><!-- ... --></table>
    // doc.autoTable({ html: "#my-table" });

    // Or use javascript directly:
    doc.autoTable({
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      head: [["Name", "Email", "Country"]],
      body: [
        ["David", "david@example.com", "Sweden"],
        ["Castille", "castille@example.com", "Spain"],
        // ...
      ],
    });

    doc.save("table.pdf");
  };

  const renderSummaryTable = (summaryKey, value) => {
    let kindArray = [];
    let finalfishKind = [];

    // zkontroluj zdali data existují
    const data = recordsTogether && recordsTogether[summaryKey];
    if (data) {
      // získej pole řádků z summary
      const fKind = Object.entries(data).map(
        ([rowKey, rowValue]) => rowValue.fishes
      );
      // řádky zredukuj na názvy ryb *kind* může vrátit pole ryb
      const reduceFKind = fKind.map((fish) =>
        Object.entries(fish).map(([kind, data]) => kind)
      );
      // pole polí zredukuj na normální pole
      reduceFKind.forEach((f) => kindArray.push(...f));
      // vyfiltruj duplicitní typy ryb
      const filteredFKind = kindArray.filter(onlyUnique);
      // zredukuj pole typů ryb na ty co jsou v daném sumáři (tímto  se zachová pořadí typů ryb pro všechny sumáře)
      finalfishKind = fishKind.filter((f) =>
        filteredFKind.includes(f.toLowerCase())
      );
    }

    return (
      <div key={summaryKey} className="summary-page_table">
        <div className="summary-page_record-name">
          <span className="summary-page_title">{value && value.summaryId}</span>

          <div style={{ display: "flex" }}>
            <div className="summary-page_icons">
              <img
                src="/export.svg"
                alt="edit"
                width="15px"
                height="15px"
                style={{ margin: "0px 8px", cursor: "pointer" }}
                onClick={exportSummary}
              ></img>
            </div>

            {/* <div className="summary-page_icons">
              <img
                src="/delete.svg"
                alt="delete"
                width="16px"
                height="16px"
                style={{ margin: "0px 8px", cursor: "pointer" }}
                onClick={() => handleDelete({ summaryUid: summaryKey })}
              ></img>
            </div> */}
          </div>
        </div>

        <Table responsive hover size="sm">
          <thead>
            <tr>
              <th colSpan="3">Revír</th>

              {finalfishKind.map((fish, index) => (
                <th
                  className="summary-page_kind"
                  colSpan="2"
                  key={`fish-kind-${index}`}
                >{`${fish}`}</th>
              ))}
              <th rowSpan="2">Počet docházek</th>
            </tr>
            <tr>
              <th>Číslo</th>
              <th style={{ minWidth: "85px" }}>Název</th>
              <th style={{ minWidth: "110px" }}>Podrevír</th>
              {finalfishKind.map((f, index) => {
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
                      {rowDataValue.alertMissingData.some((a) => a === true) ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-disabled">
                              chybějící povinná data: druh ryby, váha nebo počet
                              kusů
                            </Tooltip>
                          }
                        >
                          <span className="d-inline-block summary-page_note">
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
                    </td>
                    <td>-</td>
                    <td>
                      {rowDataValue.subdistrictNumber
                        ? rowDataValue.subdistrictNumber
                        : "-"}
                    </td>
                    {finalfishKind.map((fish, index) => {
                      return [
                        <td key={`fish-td-1-${index}`}>
                          {rowDataValue &&
                          rowDataValue.fishes &&
                          rowDataValue.fishes[fish.toLowerCase()] &&
                          rowDataValue.fishes[fish.toLowerCase()].pieces
                            ? rowDataValue.fishes[fish.toLowerCase()].pieces
                            : "-"}
                        </td>,
                        <td key={`fish-td-2-${index}`}>
                          {rowDataValue &&
                          rowDataValue.fishes &&
                          rowDataValue.fishes[fish.toLowerCase()] &&
                          rowDataValue.fishes[fish.toLowerCase()].kilograms
                            ? rowDataValue.fishes[fish.toLowerCase()].kilograms
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
    );
  };

  useEffect(() => {
    isMountedRef.current = true;
    localStorage.setItem("lastLocation", "/summary");

    if (!storeState.summaries || !storeState.records) {
      updateData();
    }

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
        {loading && <Spinner animation="border" variant="success" />}
        <h3 className="summary-page_page-title">Souhrn docházky a úlovků</h3>
        <div>
          <div className="summary-page_history-wrapper">
            {[2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
              <button
                className={
                  actualYear === year
                    ? "summary-page_history activeYear"
                    : "summary-page_history"
                }
                onClick={() => handleActualYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        {!!storeState.summaries &&
          Object.entries(storeState.summaries).length === 0 && (
            <span>Zatím nejsou žádné souhrny</span>
          )}

        <div className="summary-page_summaries">
          {!!storeState.summaries &&
            !!Object.entries(storeState.summaries).length &&
            Object.entries(storeState.summaries).map(([summaryKey, value]) =>
              renderSummaryTable(summaryKey, value)
            )}
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
      </div>
    </>
  );
};

export default SummaryPage;
