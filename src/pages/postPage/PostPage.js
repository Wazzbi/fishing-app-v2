import React, { useEffect, useState, useContext, useCallback } from "react";
import firebaseService from "../../services/firebase/firebase.service";
import "./postPage.scss";
import { Link } from "react-router-dom";
import { StoreContext } from "../../store/Store";

import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO like btn + komentaře
// TODO pořdná animace než se načtou obr a pak modal
// TODO effect cleanUp

const PostPage = (props) => {
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
    let promise = firebaseService.getPost(params.id);
    let response = await promise;
    setPost(response);
  }, [params]);

  useEffect(() => {
    localStorage.setItem("lastLocation", `/post/${params.id}`);
    if (!post) {
      if (storeState.selectedPost) {
        setPost(storeState.selectedPost);
      } else {
        getPost();
      }
      // nasty react...
      // https://stackoverflow.com/questions/58431946/why-does-my-react-router-link-bring-me-to-the-middle-of-a-page
      window.scrollTo(0, 0);
    }

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

  return (
    <>
      <div className="post-page_main">
        <div className="post-page-post">
          <Button
            variant="outline-dark"
            as={Link}
            to={"/news"}
            className="post-page_back-btn-icon"
            title="Back"
          ></Button>
          {post && (
            <div>
              <p className="post-page_title">{post.title}</p>
              <p>
                <small style={{ color: "#808080", fontFamily: "poppins" }}>
                  {post.username} {" | "} {post.created}
                </small>
              </p>
              <p className="post-page_icons-group">
                <Badge variant="dark">{post.category}</Badge>
                <img src="/comment.svg" alt="" height="15px" width="15px"></img>
                <small style={{ color: "#808080", fontFamily: "poppins" }}>
                  1526
                </small>
                <img src="/heart.svg" alt="" height="15px" width="15px"></img>
                <small style={{ color: "#808080", fontFamily: "poppins" }}>
                  99.1k
                </small>
              </p>

              <div
                className="post-page_text"
                dangerouslySetInnerHTML={{ __html: post.text }}
              ></div>

              {!!post.images && (
                <div className="post-page_images-container">
                  {post.images.map((image, index) => (
                    <div
                      key={`image-${index}`}
                      className="post-page_animated-background"
                    >
                      <img
                        src={images[index]}
                        alt=""
                        className="post-page_image"
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
            contentClassName="post-page_modal-images-modal"
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
                          className="post-page_modal-images"
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

export default PostPage;
