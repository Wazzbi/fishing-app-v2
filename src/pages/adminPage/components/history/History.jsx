import React, { useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const History = ({ storeState, getFilteredAdminNotes, getAdminNotes }) => {
  const [searchCriteria, setSearchCriteria] = useState("date"); // default value of this field

  const convertToDate = (dateString) => {
    const date = new Date(+dateString);
    return date.toLocaleDateString();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { searchCriterium, searchValue } = event.target.elements;
    let searchMe;
    if (searchCriterium.value === "date") {
      searchMe = new Date(searchValue.value).getTime().toString().slice(0, 7);
    } else {
      searchMe = searchValue.value.toString();
    }
    getFilteredAdminNotes(searchCriterium.value, searchMe);
  };

  return (
    <>
      <div className="admin-page-section">
        <div>
          <p className="admin-page_title">
            <strong>Historie událostí</strong>
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} controlId="formGridCriterium">
                <Form.Label>Vyhledat dle:</Form.Label>
                <Form.Control
                  as="select"
                  defaultValue="Datum"
                  name="searchCriterium"
                  onChange={(e) => setSearchCriteria(e.target.value)}
                >
                  <option value="date">Datum</option>
                  <option value="case">Případ</option>
                  <option value="userId">Uživatel (ID)</option>
                  <option value="solverId">Řešitel (ID)</option>
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridSearchValue">
                <Form.Label>Hledat:</Form.Label>
                {searchCriteria === "date" ? (
                  <Form.Control name="searchValue" type="date" />
                ) : searchCriteria === "userId" ||
                  searchCriteria === "solverId" ? (
                  <Form.Control name="searchValue" type="number" />
                ) : (
                  <Form.Control
                    as="select"
                    defaultValue="Reported Post BLOCKED"
                    name="searchValue"
                  >
                    <option value="Reported Post BLOCKED">
                      Reported Post BLOCKED
                    </option>
                    <option value="Reported Post FREE">
                      Reported Post FREE
                    </option>
                    <option value="Reported Post DELETED">
                      Reported Post DELETED
                    </option>
                    <option value="User BLOCKED">User BLOCKED</option>
                    <option value="User UNBLOCKED">User UNBLOCKED</option>
                  </Form.Control>
                )}
              </Form.Group>

              <Form.Group as={Col} controlId="submitButton">
                <Button
                  variant="success"
                  type="submit"
                  style={{ position: "absolute", bottom: "0" }}
                >
                  Najít
                </Button>

                <Button
                  variant="outline-success"
                  style={{ position: "absolute", bottom: "0", left: "80px" }}
                  onClick={getAdminNotes}
                >
                  Reset
                </Button>
              </Form.Group>
            </Form.Row>
          </Form>

          <div style={{ maxHeight: "500px", overflow: "auto" }}>
            <Table size="sm">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Případ</th>
                  <th>Uživatel</th>
                  <th>Příspěvek</th>
                  <th>Akce pozn.</th>
                  <th>Řešitel</th>
                </tr>
              </thead>
              <tbody>
                {storeState &&
                  storeState.adminNotes &&
                  Object.entries(storeState.adminNotes)
                    .reverse()
                    .map(([noteKey, noteValue]) => (
                      <tr>
                        <td>{convertToDate(noteValue.noteId)}</td>
                        <td>{noteValue.case}</td>
                        <td>
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.userId}{" "}
                          (
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.username}
                          )
                        </td>
                        <td>
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.postUrl && (
                              <a
                                href={noteValue.detail.postUrl}
                                target="_blank"
                                style={{ color: "blue" }}
                              >
                                Odkaz
                              </a>
                            )}
                        </td>
                        <td>
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.solverNote}
                        </td>
                        <td>
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.solverId}{" "}
                          (
                          {noteValue &&
                            noteValue.detail &&
                            noteValue.detail.solverName}
                          )
                        </td>
                      </tr>
                    ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
