import React from "react";
import Table from "react-bootstrap/Table";

const History = ({ storeState }) => {
  const convertToDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="admin-page-section">
        <div>
          <p className="admin-page_title">
            <strong>Historie událostí</strong>
          </p>

          <Table size="sm">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Případ</th>
                <th>Uživatel</th>
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
                        {noteValue && noteValue.detail && noteValue.detail.user}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default History;
