import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../../Auth";
import JoditEditor from "jodit-react";
import { configEditor, optionsMed, optionsMin } from "./constants";
import Jdenticon from "react-jdenticon";
import { StoreContext } from "../../store/Store";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

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
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();

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

  // TODO podle id inputu upravovat index v poli uploadedImages
  const handleChangeImage = (e, i) => {
    // TODO nahrávání více fotek (přidat další input)

    const f = e.target.files[0];
    const fr = new FileReader();

    if (f) {
      fr.onload = async (ev2) => {
        const name = Date.now();
        const file = dataURLtoFile(ev2.target.result, name);
        const type =
          f.type.indexOf("/") !== -1
            ? f.type.slice(f.type.indexOf("/") + 1)
            : f.type;

        try {
          let o;
          await imageCompression(file, optionsMed).then((blob) => {
            o = { ...o, med: { blob, name, type, size: 400 } };
          });
          await imageCompression(file, optionsMin).then((blob) => {
            o = { ...o, min: { blob, name, type, size: 200 } };
          });
          // nahrát fotku na pozici dle indexu input pole
          uploadImages[i] = o;
          if (isMountedRef.current) {
            setUploadImages([...uploadImages]);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fr.readAsDataURL(f);
    } else {
      // držet pozici kvůli indexu kdyby uživatel chtěl přehrát fotku
      uploadImages[i] = {};
      if (isMountedRef.current) {
        setUploadImages([...uploadImages]);
      }
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
        style={{ padding: "5px" }}
        loader={
          <div style={{ textAlign: "center" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {postsRender.map(([postKey, postValue]) => (
          <div
            key={postKey}
            className="news-page_post"
            onClick={() => changeRoute(postKey)}
          >
            <div className="news-page_header">
              <div className="news-page_post-icon">
                <Jdenticon size="30" value={postValue.username || ""} />
              </div>
              <div className="news-page_header-title">
                <span>{postValue.title}</span>
                <br />
                <small>
                  {postValue.username} {" | "} {postValue.created}
                </small>
              </div>
            </div>
            <div
              id={`${postKey}-post-text`}
              className="news-page_post-text"
              dangerouslySetInnerHTML={{ __html: postValue.text }}
            ></div>
            <div className="news-page_post-text-overlay">
              <div className="news-page_post-text-overlay-icon-group-left">
                <img src="/comment.svg" alt="" height="15px" width="15px"></img>
                <span>1526</span>
                <img src="/heart.svg" alt="" height="15px" width="15px"></img>
                <span>99.1k</span>
              </div>

              <img src="/right.svg" alt="" height="15px" width="15px"></img>
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
          label="Example file input"
          accept="image/*"
          onChange={(event) => handleChangeImage(event, index)}
        />
      );
      element.push(x);
    }
    return element;
  };

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
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </div>

      <Button
        variant="primary"
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
              variant="primary"
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
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" name="category" required>
                <option>Law</option>
                <option>Post</option>
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" maxLength="60" required />
            </Form.Group>

            <Form.Group>
              <Form.Label>Example textarea</Form.Label>
              <JoditEditor
                ref={editor}
                value={text}
                config={configEditor}
                tabIndex={1} // tabIndex of textarea
                onBlur={(newContent) => onEditorChange(newContent)} // preferred to use only this option to update the content for performance reasons
                onChange={(newContent) => {}}
              />
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
