import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../../Auth";
import JoditEditor from "jodit-react";
import { configEditor } from "./constants";
import Jdenticon from "react-jdenticon";
import { StoreContext } from "../../store/Store";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

const Compress = require("compress.js");

// TODO emoji, odkazy
// TODO main kontajner udělat squeeze a nakonec s flex-base nebo min-width
// TODO vytvořit 'moje zeď' s příspěvky kde budu mít odebírat
// TODO možnost dávat si příspěvky do oblíbených
// !! nezapomenout na LazyLoad componentu <LazyLoadImage/> umí i lazyload component
// TODO přiadt tlačítko na refresh postů (scroll to top + init())

const NewsPage = ({ history }) => {
  const { currentUserData } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [uploadImages, setUploadImages] = useState([]);
  const [inputImageFieldCounter, setInputImageFieldCounter] = useState(1);
  const [text, setText] = useState("");
  const [storeState, dispatch] = useContext(StoreContext);
  const [postCount, setPostCount] = useState(null);
  const [uploadPostDone, setUploadPostDone] = useState(true);

  const editor = useRef(null);
  const isMountedRef = useRef(true);
  const compress = new Compress();

  function storePosition() {
    let scrollBarPosition = window.pageYOffset | document.body.scrollTop;
    dispatch({
      type: "NEWS_SCROLL_POSITION",
      payload: scrollBarPosition,
    });
  }

  const handleClose = () => {
    if (isMountedRef.current) {
      setUploadImages([]);
      setShow(false);
      setInputImageFieldCounter(1);
    }
  };
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    if (isMountedRef.current) {
      handleClose();
      setInputImageFieldCounter(1);
      setUploadPostDone(false);
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
          firebaseService.createImage(imageArray).then(() => {
            if (isMountedRef.current) {
              setUploadImages([]);
              setText(null);
              setUploadPostDone(true);
              init();
              firebaseService.getPostsCount().then((r) => {
                if (isMountedRef.current) {
                  setPostCount(r);
                }
              });
            }
          });
        });
    }
  };

  const onEditorChange = (evt) => {
    if (isMountedRef.current) {
      setText(evt.srcElement.innerHTML);
    }
  };

  const handleChangeImage = async (e, i) => {
    const files = [...e.target.files];

    if (!!files.length) {
      const name = Date.now();
      const type =
        files[0].type.indexOf("/") !== -1
          ? files[0].type.slice(files[0].type.indexOf("/") + 1)
          : files[0].type;

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
          setUploadImages([...uploadImages]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // držet pozici kvůli indexu kdyby uživatel chtěl přehrát fotku
      uploadImages[i] = {};
      if (isMountedRef.current) {
        setUploadImages([...uploadImages]);
      }
    }
  };

  const init = useCallback(() => {
    let ww = {};
    firebaseService.getPostsInit().once("value", (snapshot) => {
      if (isMountedRef.current) {
        snapshot.forEach((childSnapshot) => {
          ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };
          dispatch({
            type: "ADD_POSTS",
            payload: { ...storeState.posts, ...ww },
          });
        });
      }
    });
  }, [dispatch, storeState.posts]);

  // https://www.npmjs.com/package/react-lazy-load-image-component
  // https://www.npmjs.com/package/react-infinite-scroll-component
  const renderPosts = () => {
    let t = Object.entries(storeState.posts); // [[postKey,postValue], ...]
    let postsRender = t.sort().reverse();

    let lastPost = postsRender[postsRender.length - 1];
    let lastPostTimeStamp = lastPost[1].timeStamp;

    const fetchMorePosts = async () => {
      let ww = {};
      await firebaseService
        .getPostsLimited(lastPostTimeStamp)
        .once("value", (snapshot) => {
          if (isMountedRef.current) {
            snapshot.forEach((childSnapshot) => {
              ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };
              dispatch({
                type: "ADD_POSTS",
                payload: { ...storeState.posts, ...ww },
              });
            });
          }
        });
    };

    return (
      <InfiniteScroll
        dataLength={postsRender.length}
        next={fetchMorePosts}
        hasMore={postCount !== postsRender.length}
        loader={
          <div style={{ textAlign: "center" }}>
            <Spinner animation="border" variant="success" />
          </div>
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Jaj! To je vše</b>
          </p>
        }
        style={{ overflow: "hidden" }}
      >
        {postsRender.map(([postKey, postValue]) => (
          <div
            key={postKey}
            className="news-page_post"
            onClick={() => changeRoute(postKey)}
          >
            <div className="news-page_header">
              <div className="news-page_header-title">
                <div className="news-page_header-title-first-row">
                  <Jdenticon size="30" value={postValue.username || ""} />
                  <small>
                    {postValue.username} {" | "} {postValue.created}
                  </small>
                </div>
                <span>{postValue.title}</span>
              </div>
            </div>
            <div className="news-page_post-text-wrapper">
              <div
                id={`${postKey}-post-text`}
                className="news-page_post-text"
                dangerouslySetInnerHTML={{ __html: postValue.text }}
              ></div>
              <div className="news-page_post-text-overlay"></div>
            </div>

            <div className="news-page_post-footer">
              <div className="news-page_post-footer-icon-group-left">
                <img src="/comment.svg" alt="" height="16px" width="16px"></img>
                <span style={{ color: "#808080" }}>1526</span>
                <img src="/heart.svg" alt="" height="16px" width="16px"></img>
                <span style={{ color: "#808080" }}>99.1k</span>
              </div>

              <img src="/right.svg" alt="" height="16px" width="15px"></img>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    );
  };

  const changeRoute = (postKey) => {
    dispatch({ type: "ADD_SELECTED_POST", payload: storeState.posts[postKey] });
    history.push(`/post/${postKey}`);
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

  useEffect(() => {
    window.addEventListener("scroll", storePosition);

    if (storeState.newsPageScrollPosition) {
      window.scrollTo(0, storeState.newsPageScrollPosition);
    }
    return () => window.removeEventListener("scroll", storePosition);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    localStorage.setItem("lastLocation", "/news");

    firebaseService.getPostsCount().then((r) => {
      if (isMountedRef.current) {
        setPostCount(r);
      }
    });

    if (!storeState.posts) {
      init();
    }
    return () => (isMountedRef.current = false);
  }, [init, storeState.posts]);

  return (
    <>
      <div className="news-page_main">
        {!!storeState.posts ? (
          renderPosts()
        ) : (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Spinner animation="border" variant="success" />
          </div>
        )}
      </div>

      <Button
        variant="success"
        className="news-page_float-btn"
        onClick={handleShow}
        disabled={!uploadPostDone}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {uploadPostDone ? (
          <img src="/plus.svg" alt="" width="30px" height="30px"></img>
        ) : (
          <Spinner
            as="span"
            animation="border"
            role="status"
            aria-hidden="true"
            style={{ width: "30px", height: "30px" }}
          />
        )}
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
            <Form.Group id="inputImages">{renderInputImageFields()}</Form.Group>
            <Button
              variant="success"
              onClick={() => {
                setInputImageFieldCounter(inputImageFieldCounter + 1);
                uploadImages[inputImageFieldCounter] = {};
                setUploadImages([...uploadImages]);
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
              <Form.Control type="text" name="title" maxLength="60" required />
            </Form.Group>

            <Form.Group>
              <Form.Label>Text příspěvku</Form.Label>
              <JoditEditor
                ref={editor}
                value={text}
                config={configEditor}
                tabIndex={1} // tabIndex of textarea
                onBlur={(newContent) => onEditorChange(newContent)} // preferred to use only this option to update the content for performance reasons
                onChange={(newContent) => {}}
              />
            </Form.Group>

            <Button variant="success" type="submit">
              Potvrdit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewsPage;
