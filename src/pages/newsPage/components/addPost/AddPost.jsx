import React, { useRef } from "react";
import JoditEditor from "jodit-react";
import { configEditor } from "../../constants";
import Modal from "react-bootstrap/Modal";
import loadImage from "blueimp-load-image";
import firebaseService from "../../../../services/firebase/firebase.service";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const Compress = require("compress.js");
const exifr = require("exifr");

// TODO některé funkce jako init mít jen v newsPage a ne je spouštět odtud

const AddPost = ({
  show,
  handleClose,
  inputImageFieldCounter,
  handleSetInputImageFieldCounter,
  uploadImages,
  handleSetUploadImages,
  text,
  handleSetText,
  isMountedRef,
  handleSetUploadPostDone,
  init,
  handleSetPostCount,
  currentUserData,
  handleError,
}) => {
  const editor = useRef(null);
  const compress = new Compress();

  const handleSubmit = (event) => {
    if (isMountedRef.current) {
      handleClose();

      if (currentUserData && currentUserData.blockedUser) {
        return handleError();
      }
      handleSetInputImageFieldCounter(1);
      handleSetUploadPostDone(false);
      event.preventDefault();
      const { title, category } = event.target.elements;
      const usrname = currentUserData && currentUserData.username;
      const usrId = currentUserData && currentUserData.id;

      const postId = Date.now();
      let currentdate = new Date();
      let datetime =
        currentdate.getDate() +
        "." +
        (currentdate.getMonth() + 1) +
        "." +
        currentdate.getFullYear() +
        " " +
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes();

      const created = datetime;

      // TODO filtrování na med nechtěl object.entries fungovat...
      const imageArray = uploadImages.filter((e) => !!e.med);
      const imageArrayMetaData = imageArray.map((t) => {
        return {
          imageName: t.med.name,
          imageType: t.med.type,
        };
      });

      firebaseService
        .createPost(
          text,
          imageArrayMetaData,
          usrname,
          created,
          title.value,
          usrId,
          category.value,
          postId
        )
        .then(() => {
          firebaseService
            .createImage(imageArray)
            .then(() => {
              if (isMountedRef.current) {
                handleSetUploadImages([]);
                handleSetText(null);
                handleSetUploadPostDone(true);
                init();
                firebaseService.getPostsCount().then((r) => {
                  if (isMountedRef.current) {
                    handleSetPostCount(r);
                  }
                });
              }
            })
            .catch((err) => {
              handleSetUploadPostDone(true);
              handleError();
            });
        })
        .catch((err) => {
          handleSetUploadPostDone(true);
          handleError();
        });
    }
  };

  const handleChangeImage = async (e, i) => {
    let files = [...e.target.files];

    if (!!files.length) {
      const name = Date.now();
      const type =
        files[0].type.indexOf("/") !== -1
          ? files[0].type.slice(files[0].type.indexOf("/") + 1)
          : files[0].type;

      loadImage(
        files[0],
        async (img, data) => {
          // když je orientace 6 a 3 (mobil na výšku neb na šířku doleva) -> otoč
          let orientation = await exifr.orientation(files[0]);

          let changeOrientation = [3, 6].includes(orientation);

          if (data.imageHead && data.exif && changeOrientation) {
            loadImage.writeExifData(data.imageHead, data, "Orientation", 1);
            img.toBlob(function (blob) {
              loadImage.replaceHead(blob, data.imageHead, async (newBlob) => {
                files = [newBlob];
                // TODO tento blok se opakuje -> refaktorovat
                try {
                  let o;
                  let smallImage = await compress.compress(files, {
                    size: 0.5,
                    quality: 0.75,
                    maxWidth: 200,
                    maxHeight: 200,
                    resize: true,
                  });
                  let img1 = smallImage[0];
                  let base64str = img1.data;
                  let imgExt = img1.ext;
                  let blob = Compress.convertBase64ToFile(base64str, imgExt);
                  o = { ...o, min: { blob, name, type, size: 200 } };

                  let bigImage = await compress.compress(files, {
                    size: 1.5,
                    quality: 0.75,
                    maxWidth: 800,
                    maxHeight: 800,
                    resize: true,
                  });
                  img1 = bigImage[0];
                  base64str = img1.data;
                  imgExt = img1.ext;
                  blob = Compress.convertBase64ToFile(base64str, imgExt);
                  o = { ...o, med: { blob, name, type, size: 400 } };

                  uploadImages[i] = o;
                  if (isMountedRef.current) {
                    handleSetUploadImages([...uploadImages]);
                  }
                } catch (err) {
                  console.error(err);
                }
              });
            }, "image/jpeg");
          } else {
            try {
              let o;
              let smallImage = await compress.compress(files, {
                size: 0.5,
                quality: 0.75,
                maxWidth: 200,
                maxHeight: 200,
                resize: true,
              });
              let img1 = smallImage[0];
              let base64str = img1.data;
              let imgExt = img1.ext;
              let blob = Compress.convertBase64ToFile(base64str, imgExt);
              o = { ...o, min: { blob, name, type, size: 200 } };

              let bigImage = await compress.compress(files, {
                size: 1.5,
                quality: 0.75,
                maxWidth: 800,
                maxHeight: 800,
                resize: true,
              });
              img1 = bigImage[0];
              base64str = img1.data;
              imgExt = img1.ext;
              blob = Compress.convertBase64ToFile(base64str, imgExt);
              o = { ...o, med: { blob, name, type, size: 400 } };

              uploadImages[i] = o;
              if (isMountedRef.current) {
                handleSetUploadImages([...uploadImages]);
              }
            } catch (err) {
              console.error(err);
            }
          }
        },
        { meta: true, orientation: true, canvas: true, maxWidth: 800 }
      );
    } else {
      // držet pozici kvůli indexu kdyby uživatel chtěl přehrát fotku
      uploadImages[i] = {};
      if (isMountedRef.current) {
        handleSetUploadImages([...uploadImages]);
      }
    }
  };

  const renderInputImageFields = () => {
    const element = [];
    for (let index = 0; index < inputImageFieldCounter; index++) {
      const x = (
        <Form.File
          key={`form-file-${index}`}
          id={`input-image-${index}`}
          name="file"
          label="Přiložit fotku"
          accept="image/*"
          onChange={(event) => handleChangeImage(event, index)}
        />
      );
      element.push(x);
    }
    return element;
  };

  // TODO co jsem to změnit na text area tak to posílat stejně jako title a kategorii a toto zrušit
  const onEditorChange = (evt) => {
    if (isMountedRef.current) {
      handleSetText(evt.target.value);
    }
  };

  return (
    <>
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
          <div className="news-page_modal">
            <Form onSubmit={handleSubmit}>
              <Form.Group id="inputImages">
                {renderInputImageFields()}
              </Form.Group>
              <Button
                variant="success"
                onClick={() => {
                  handleSetInputImageFieldCounter(inputImageFieldCounter + 1);
                  uploadImages[inputImageFieldCounter] = {};
                  handleSetUploadImages([...uploadImages]);
                }}
                disabled={
                  uploadImages.length === 0 ||
                  uploadImages.some((i) => Object.entries(i).length === 0)
                }
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "30px",
                  height: "30px",
                  marginBottom: "10px",
                }}
              >
                <img src="/plus.svg" alt="" width="15px" height="15px"></img>
              </Button>

              <Form.Group>
                <Form.Label>Kategorie</Form.Label>
                <Form.Control as="select" name="category" required>
                  <option>Info</option>
                  <option>Post</option>
                  <option>Zajímavost</option>
                  <option>Svět</option>
                  <option>CZ</option>
                  <option>SK</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Titul</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  maxLength="60"
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Text příspěvku</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  onBlur={(newContent) => onEditorChange(newContent)}
                />
              </Form.Group>

              <Button variant="success" type="submit">
                Potvrdit
              </Button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPost;
