import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import "./blockedPage.scss";
import { Link } from "react-router-dom";
import { StoreContext } from "../../store/Store";
import Jdenticon from "react-jdenticon";
import saveLastPathService from "../../services/utils/saveLastPath.service";
import { AuthContext } from "../../Auth";

import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO like btn + komentaře
// TODO pořdná animace než se načtou obr a pak modal
// TODO effect cleanUp

const BlockedPage = (props) => {
  const { currentUserData } = useContext(AuthContext);

  const params = props.match.params; // id postu
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesLarge, setImagesLarge] = useState([]);
  const [show, setShow] = useState(false);
  const [activeImageCarousel, setActiveImageCarousel] = useState(false);
  const [storeState, dispatch] = useContext(StoreContext);

  const handleClose = () => setShow(false);
  const handleShow = (index) => {
    setActiveImageCarousel(index);
    fetchImagesLarge();
    setShow(true);
  };

  const fetchImages = useCallback(async () => {
    if (post && post.images) {
      let w = [];
      for (const image of post.images) {
        let promise = firebaseService.getImageUrl(
          image.imageName,
          200,
          image.imageType
        );
        let response = await promise;
        w.push(response);
      }
      setImages(w);
    }
  }, [post]);

  const fetchImagesLarge = async () => {
    if (post && post.images) {
      let w = [];
      for (const image of post.images) {
        let promise = firebaseService.getImageUrl(
          image.imageName,
          400,
          image.imageType
        );
        let response = await promise;
        w.push(response);
      }
      setImagesLarge(w);
    }
  };

  const getPost = useCallback(async () => {
    let promise = firebaseService.getBlockedPost(params.id);
    let response = await promise;
    setPost(response);
  }, [params]);

  useEffect(() => {
    saveLastPathService.setWithExpiry(
      "lastLocation",
      `/blockedPost/${params.id}`
    );
    getPost();
    window.scrollTo(0, 0);

    if (post && !images.length) {
      fetchImages();
    }
  }, [
    params.id,
    post,
    images.length,
    storeState.selectedPost,
    getPost,
    fetchImages,
  ]);

  useEffect(() => {
    // nepostit uživatele bez oprávnění na page admin
    if (currentUserData && currentUserData.role === "user") {
      props.history.push("/home");
    }
  });

  return (
    <>
      <div className="blocked-page_main">
        <div className="blocked-page-post">
          <h3 style={{ color: "red", textAlign: "center" }}>
            Blokovaný příspěvek
          </h3>
          {post && (
            <div>
              <p className="blocked-page_title">
                <strong>{post.title}</strong>
              </p>
              <p style={{ display: "flex", alignItems: "center" }}>
                <Jdenticon size="30" value={post.userId.toString() || ""} />
                <small
                  style={{
                    color: "#808080",
                    fontFamily: "poppins",
                    marginLeft: "10px",
                  }}
                >
                  {post.username} {" | "} {post.created}
                </small>
              </p>
              <p className="blocked-page_icons-group">
                <Badge variant="dark">{post.category}</Badge>
                <img src="/comment.svg" alt="" height="15px" width="15px"></img>
                <small style={{ color: "#808080", fontFamily: "poppins" }}>
                  1526
                </small>
                <img src="/heart.svg" alt="" height="15px" width="15px"></img>
                <small style={{ color: "#808080", fontFamily: "poppins" }}>
                  99.1k
                </small>
                <img
                  src="/bookmark.svg"
                  alt=""
                  height="16px"
                  width="16px"
                ></img>
                <small style={{ color: "#808080" }}>Uložit</small>
              </p>

              <div className="blocked-page_text">{post.text}</div>

              {!!post.images && (
                <div className="blocked-page_images-container">
                  {post.images.map((image, index) => (
                    <div
                      key={`image-${index}`}
                      className="blocked-page_animated-background"
                    >
                      <img
                        src={images[index]}
                        alt=""
                        className="blocked-page_image"
                        onClick={() => handleShow(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Modal
            show={show}
            onHide={handleClose}
            animation={false}
            size="lg"
            contentClassName="blocked-page_modal-images-modal"
            centered
          >
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              {!!imagesLarge.length && (
                <Carousel
                  controls={imagesLarge.length > 1 ? true : false}
                  defaultActiveIndex={activeImageCarousel}
                  interval={null}
                >
                  {imagesLarge.map((imageUrl, index) => (
                    <Carousel.Item key={`carousel-item-${index}`}>
                      <div className="loader">
                        <img
                          src={imageUrl}
                          alt=""
                          className="blocked-page_modal-images"
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default BlockedPage;
