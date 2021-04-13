import React from "react";

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

          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Případ</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {storeState &&
                storeState.adminNotes &&
                Object.entries(storeState.adminNotes).map(
                  ([noteKey, noteValue]) => (
                    <tr>
                      <td style={{ paddingRight: "30px" }}>
                        {convertToDate(noteValue.noteId)}
                      </td>
                      <td style={{ paddingRight: "30px" }}>{noteValue.case}</td>
                      <td style={{ paddingRight: "30px" }}>
                        {noteValue &&
                          noteValue.detail &&
                          noteValue.detail.postId}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default History;
