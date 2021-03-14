import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import firebaseService from "../../services/firebase/firebase.service";
import "./postPage.scss";
import { Link } from "react-router-dom";

import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// TODO když není nic ve storu tak si post a image stáhnout (např když proběhne refrash stránky)
// TODO placeholdry při mačítání obrázku

const PostPage = (props) => {
  const params = props.match.params; // id postu
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesLarge, setImagesLarge] = useState([]);
  const [show, setShow] = useState(false);
  const [activeImageCarousel, setActiveImageCarousel] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = (index) => {
    setActiveImageCarousel(index);
    fetchImagesLarge();
    setShow(true);
  };

  const fetchImages = async () => {
    if (post && post.images) {
      let w = [];
      for (const image of post.images) {
        console.log(post.images);
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
  };

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

  const getPost = async () => {
    let promise = firebaseService.getPost(params.id);
    let response = await promise;
    setPost(response);
  };

  useEffect(() => {
    if (!post) {
      const u = store.getState().posts.selectedPost;
      if (u) {
        setPost(u);
      } else {
        // TODO když se post nestáhne ze storu (např refresh stránky) tak si stáhnout post z firebase
        getPost();
      }
    }

    if (post && !images.length) {
      fetchImages();
    }

    const unsubscribe = store.subscribe(() => {
      setPost(store.getState().posts.selectedPost);
    });

    return unsubscribe;
  }, [post]);

  return (
    <>
      <div className="post-page_main">
        <Button variant="outline-primary" as={Link} to={"/news"}>
          Back
        </Button>
        {post && (
          <div>
            <h1>{post.title}</h1>
            <p>
              <small>
                {post.username} {" | "} {post.created}
              </small>
            </p>
            <p>
              <Badge variant="primary">{post.category}</Badge>
            </p>

            <div dangerouslySetInnerHTML={{ __html: post.text }}></div>

            <div className="post-page_images-container">
              {!!images.length &&
                images.map((image, index) => (
                  <img
                    src={images[index]}
                    className="post-page_image"
                    onClick={() => handleShow(index)}
                  ></img>
                ))}
            </div>
          </div>
        )}

        <Modal
          show={show}
          onHide={handleClose}
          animation={false}
          contentClassName="post-page_modal-images-modal"
          centered
        >
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            {!!imagesLarge.length && (
              <Carousel
                controls={imagesLarge.length > 1 ? true : false}
                defaultActiveIndex={activeImageCarousel}
              >
                {imagesLarge.map((imageUrl) => (
                  <Carousel.Item>
                    <img
                      src={imageUrl}
                      className="post-page_modal-images"
                    ></img>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default PostPage;
