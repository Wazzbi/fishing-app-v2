import React from "react";
import Modal from "react-bootstrap/Modal";
import firebaseService from "../../../../services/firebase/firebase.service";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// TODO některé funkce jako init mít jen v newsPage a ne je spouštět odtud

const ReportPost = ({ show, handleClose, isMountedRef, handleReport }) => {
  const handleSubmit = (event) => {
    if (isMountedRef.current) {
      handleClose();
      event.preventDefault();
      const { category, reportText } = event.target.elements;
      handleReport(category.value, reportText.value);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        animation={true}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nahlásit příspěvek</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="news-page_modal">
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Čím je příspěvek špatný:</Form.Label>
                <Form.Control as="select" name="category" required>
                  <option>Rasismus</option>
                  <option>Sexismus</option>
                  <option>Jiné</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Důvod nahlášení příspěvku:</Form.Label>
                <Form.Control
                  as="textarea"
                  id="reportText"
                  name="reportText"
                  rows={3}
                />
              </Form.Group>

              <Button variant="success" type="submit">
                Poslat report
              </Button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReportPost;
