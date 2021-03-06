import React, { useState, useCallback } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const shortid = require("shortid");

// TODO emoji, odkazy
// TODO main kontajner udělat squeeze a nakonec s flex-base nebo min-width

const NewsPage = () => {
  const [show, setShow] = useState(false);
  const [uploadImage, setUploadImage] = useState({
    blob: null,
    name: null,
    type: null,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    handleClose();
    event.preventDefault();
    const { text } = event.target.elements;
    // TODO createPost posílat uploadImage podle kterého si budu post pak načítat obrázky
    console.log("type ", uploadImage.type);
    firebaseService.createPost(text.value);
    firebaseService.createImage(
      uploadImage.blob,
      uploadImage.name,
      uploadImage.type
    );
  };

  const handleChangeImage = (e) => {
    // TODO nahrávání více fotek (přidat další input)
    // TODO ukládat aspoň dve velikosti obrázku a pak podle pc/mobile vracet
    const f = e.target.files[0];
    const fr = new FileReader();

    fr.onload = function (ev2) {
      const name = shortid.generate();
      const blob = dataURLtoFile(ev2.target.result, name);
      const type =
        f.type.indexOf("/") !== -1
          ? f.type.slice(f.type.indexOf("/") + 1)
          : f.type;
      setUploadImage({ blob, name, type });
    };

    if (f) {
      fr.readAsDataURL(f);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

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
              <Form.File
                name="file"
                label="Example file input"
                accept="image/*"
                onChange={handleChangeImage}
              />
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
