import React, { useState, useCallback } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const NewsPage = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = useCallback(async (event) => {
    handleClose();
    event.preventDefault();
    const { file, text } = event.target.elements;
    console.log(file.value);
    firebaseService.createPost(file.value, text.value);
  }, []);

  return (
    <>
      <h1>NewsPage</h1>
      <div className="main"></div>
      <Button variant="success" className="float-btn" onClick={handleShow}>
        ADD POST
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        animation={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Přidat příspěvek</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.File name="file" label="Example file input" />
            </Form.Group>

            <Form.Group>
              <Form.Label>Example textarea</Form.Label>
              <Form.Control as="textarea" rows={3} name="text" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewsPage;
