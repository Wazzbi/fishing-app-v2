import React, { useState, useCallback } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

// TODO emoji, odkazy

const NewsPage = () => {
  const [show, setShow] = useState(false);
  const [uploadImage, setUploadImage] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    handleClose();
    event.preventDefault();
    const { text } = event.target.elements;
    // TODO createPost posílat uploadImage podle kterého si budu post pak načítat obrázky
    console.log("type ", uploadImage);
    firebaseService.createPost(text.value);
  };

  const handleChangeImage = (e) => {
    // TODO uložit s unikátním názvem obrázku
    // TODO odmazat obrázek
    // TODO nahrávání více fotek (přidat další input)
    // TODO ukládat aspoň dve velikosti obrázku a pak podle pc/mobile vracet
    // TODO načítat pouze obr soubory
    var f = e.target.files[0];
    var fr = new FileReader();

    setUploadImage(f.name);

    fr.onload = function (ev2) {
      console.dir(ev2);
      let blob = dataURLtoFile(ev2.target.result, "test");
      firebaseService.createImage(blob);
    };

    fr.readAsDataURL(f);
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
