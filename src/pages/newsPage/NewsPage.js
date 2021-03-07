import React, { useState, useCallback, useEffect } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const shortid = require("shortid");

// TODO emoji, odkazy
// TODO main kontajner udělat squeeze a nakonec s flex-base nebo min-width
// TODO funkce init bude chtít vychitat pro infinite scroll + nejaký loading anime než se načte init
// TODO pořadí posts od nejnovejšího

const NewsPage = () => {
  const [show, setShow] = useState(false);
  const [uploadImages, setUploadImages] = useState(null);
  const [posts, setPosts] = useState(null);
  const [images, setImages] = useState([]);
  const [postCards, setPostCards] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    // !! když se přiloží obr a rychle klikne submit tak jestě není reference v useState
    // !! udělat disable na submit než se vytvoří objekt v useState
    handleClose();
    event.preventDefault();
    const { text } = event.target.elements;
    // TODO createPost posílat uploadImage podle kterého si budu post pak načítat obrázky
    const imgName =
      (uploadImages && uploadImages.max && uploadImages.max.name) || "";
    const imgType =
      (uploadImages && uploadImages.max && uploadImages.max.type) || "";
    firebaseService.createPost(text.value, imgName, imgType).then(() =>
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

    console.log(f);

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
    let ee = {};
    let loaded = 0;
    firebaseService.getPostsInit().on("child_added", function (data) {
      ee = { ...ee, [data.key]: data.val() };
      ++loaded;

      // init load je nastavený na pět posts
      if (loaded === 5) {
        setPosts({ ...posts, ...ee });

        let e = {};
        const getImagesPromise = async (postKey, postValue) => {
          if (postValue.image) {
            let promise = firebaseService.getImageUrl(
              postValue.image,
              400,
              postValue.type
            );
            let response = await promise;
            e = { ...e, [postKey]: response };
            setImages({ ...images, ...e });
          }
        };

        Object.entries(ee).map(([postKey, postValue]) => {
          getImagesPromise(postKey, postValue);
        });

        setPostCards({
          posts: { ...posts, ...ee },
          images: { ...images, ...e },
        });
      }
    });
  };

  const fetchMorePosts = async (timeStamp) => {
    let ww = {};
    firebaseService
      .getPostsLimited(timeStamp)
      .on("child_added", function (data) {
        ww = { ...ww, [data.key]: data.val() };

        let e = {};
        const getImagesPromise = async (postKey, postValue) => {
          if (postValue.image) {
            let promise = firebaseService.getImageUrl(
              postValue.image,
              400,
              postValue.type
            );
            let response = await promise;
            e = { ...e, [postKey]: response };
            setImages({ ...images, ...e });
            setPosts({ ...posts, ...ww });
          } else {
            setPosts({ ...posts, ...ww });
          }
        };

        Object.entries(ww).map(([postKey, postValue], index) => {
          getImagesPromise(postKey, postValue);
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
        // loader={<h4>Loading...</h4>}
      >
        {postsRender.map(([postKey, postValue]) => (
          <section>
            {images[postKey] ? (
              <div
                style={{ width: "100%", maxWidth: "400px", minHeight: "237px" }}
              >
                <LazyLoadImage
                  alt={""}
                  effect="blur"
                  src={images[postKey]}
                  width={"100%"}
                  height={"auto"}
                />
              </div>
            ) : (
              ""
            )}

            <article>{postValue.text}</article>
          </section>
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
      <div className="main">{!!posts && !!images && renderPosts()}</div>
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
