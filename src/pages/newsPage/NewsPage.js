import React, { useState, useEffect, useContext } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../../Auth";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";

const shortid = require("shortid");

// TODO emoji, odkazy
// TODO main kontajner udělat squeeze a nakonec s flex-base nebo min-width
// TODO funkce init bude chtít vychitat pro infinite scroll + nejaký loading anime než se načte init
// TODO při submit nahoře proužek s nahráváním
// TODO router na rozkliknutý článek
// TODO vytvořit 'moje zeď' s příspěvky kde budu mít odebírat
// TODO možnost dávat si příspěvky do oblíbených

const NewsPage = () => {
  const { currentUserData } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [uploadImages, setUploadImages] = useState(null);
  const [posts, setPosts] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    // !! když se přiloží obr a rychle klikne submit tak jestě není reference v useState
    // !! udělat disable na submit než se vytvoří objekt v useState
    handleClose();
    event.preventDefault();
    const { title, text } = event.target.elements;
    const usrname = currentUserData && currentUserData.username;
    const usrId = currentUserData && currentUserData.id;

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
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    const created = datetime;

    const imgName =
      (uploadImages && uploadImages.max && uploadImages.max.name) || "";
    const imgType =
      (uploadImages && uploadImages.max && uploadImages.max.type) || "";
    firebaseService
      .createPost(
        text.value,
        imgName,
        imgType,
        usrname,
        created,
        title.value,
        usrId
      )
      .then(() =>
        firebaseService.createImage(uploadImages).then(() => {
          setUploadImages(null);

          init();
        })
      );
  };

  const handleChangeImage = (e) => {
    // TODO nahrávání více fotek (přidat další input)
    const f = e.target.files[0];
    const fr = new FileReader();

    fr.onload = async (ev2) => {
      const name = shortid.generate();
      const file = dataURLtoFile(ev2.target.result, name);
      const type =
        f.type.indexOf("/") !== -1
          ? f.type.slice(f.type.indexOf("/") + 1)
          : f.type;

      // TODO options vyvést do souboru konstant
      const optionsMax = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const optionsMed = {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };

      const optionsMin = {
        maxSizeMB: 1,
        maxWidthOrHeight: 200,
        useWebWorker: true,
      };

      try {
        let o;
        await imageCompression(file, optionsMax).then((blob) => {
          o = { ...o, max: { blob, name, type, size: 800 } };
        });
        await imageCompression(file, optionsMed).then((blob) => {
          o = { ...o, med: { blob, name, type, size: 400 } };
        });
        await imageCompression(file, optionsMin).then((blob) => {
          o = { ...o, min: { blob, name, type, size: 200 } };
        });
        setUploadImages(o);
      } catch (err) {
        console.error(err);
      }
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

  const init = () => {
    let ww = {};
    firebaseService.getPostsInit().once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };

        // TODO toto refaktorovat je to zdvojený v fetchMorePosts
        const addImagetoPost = async (postKey, postValue) => {
          if (postValue.image) {
            let promise = firebaseService.getImageUrl(
              postValue.image,
              400,
              postValue.type
            );
            let response = await promise;
            ww = { ...ww, [postKey]: { ...ww[postKey], imageUrl: response } };
          }
          setPosts({ ...posts, ...ww });
        };
        addImagetoPost(childSnapshot.key, childSnapshot.val());
      });
    });
  };

  const fetchMorePosts = async (timeStamp) => {
    let ww = {};
    firebaseService.getPostsLimited(timeStamp).once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };

        const addImagetoPost = async (postKey, postValue) => {
          if (postValue.image) {
            let promise = firebaseService.getImageUrl(
              postValue.image,
              400,
              postValue.type
            );
            let response = await promise;
            ww = { ...ww, [postKey]: { ...ww[postKey], imageUrl: response } };
          }
          setPosts({ ...posts, ...ww });
        };
        addImagetoPost(childSnapshot.key, childSnapshot.val());
      });
    });
  };

  // https://www.npmjs.com/package/react-lazy-load-image-component
  // https://www.npmjs.com/package/react-infinite-scroll-component
  const renderPosts = () => {
    let t = Object.entries(posts); // [[postKey,postValue], ...]
    let postsRender = t.sort().reverse();

    let lastPost = postsRender[postsRender.length - 1];
    let lastPostTimeStamp = lastPost[1].timeStamp;

    return (
      <InfiniteScroll
        dataLength={postsRender.length}
        next={() => fetchMorePosts(lastPostTimeStamp)}
        hasMore={true}
        style={{ padding: "10px" }}
      >
        {postsRender.map(([postKey, postValue]) => (
          <>
            <Row className="news-page_card">
              {posts[postKey] ? (
                <div
                  className="news-page_card-image"
                  style={{
                    maxWidth: "400px",
                    minHeight: "237px",
                  }}
                >
                  <LazyLoadImage
                    alt={""}
                    effect="blur"
                    src={posts[postKey].imageUrl}
                    width={"100%"}
                    height={"auto"}
                  />
                </div>
              ) : (
                ""
              )}
              <div className="news-page_card-body">
                {postValue.title ? (
                  <Card.Title>{postValue.title}</Card.Title>
                ) : (
                  ""
                )}
                <Card.Text className="news-page_card-text-sub-title">
                  {postValue.username} {postValue.created}
                </Card.Text>
                <Card.Text style={{ textAlign: "justify" }}>
                  {postValue.text}
                </Card.Text>
                <div className="news-page_overlay"></div>
              </div>
            </Row>
          </>
        ))}
      </InfiniteScroll>
    );
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <h1>NewsPage</h1>
      <div className="news-page_main">{!!posts && renderPosts()}</div>
      <Button
        variant="success"
        className="news-page_float-btn"
        onClick={handleShow}
      >
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
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" maxlength="30" />
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
