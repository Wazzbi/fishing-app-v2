import React, { useState, useEffect, useContext } from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";
import imageCompression from "browser-image-compression";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../../Auth";
import CKEditor from "ckeditor4-react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";

const shortid = require("shortid");

const ckEditorConfig = {
  toolbarGroups: [
    {
      name: "document",
      groups: ["mode", "document", "doctools"],
    },
    { name: "clipboard", groups: ["clipboard", "undo"] },
    {
      name: "editing",
      groups: ["find", "selection", "spellchecker", "editing"],
    },
    { name: "forms", groups: ["forms"] },

    { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
    {
      name: "paragraph",
      groups: ["list", "indent", "blocks", "align", "bidi", "paragraph"],
    },
    { name: "links", groups: ["links"] },
    { name: "insert", groups: ["insert"] },

    { name: "styles", groups: ["styles"] },
    { name: "colors", groups: ["colors"] },
    { name: "tools", groups: ["tools"] },
    { name: "others", groups: ["others"] },
    { name: "about", groups: ["about"] },
  ],
  removeButtons:
    "Subscript,Superscript,Save,NewPage,ExportPdf,Preview,Print,Templates,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Scayt,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,Outdent,Indent,CreateDiv,BidiLtr,BidiRtl,Language,Anchor,Image,Flash,Table,HorizontalRule,PageBreak,Iframe,ShowBlocks",
};

// TODO emoji, odkazy
// TODO main kontajner udělat squeeze a nakonec s flex-base nebo min-width
// TODO funkce init bude chtít vychitat pro infinite scroll + nejaký loading anime než se načte init
// TODO při submit nahoře proužek s nahráváním
// TODO router na rozkliknutý článek
// TODO vytvořit 'moje zeď' s příspěvky kde budu mít odebírat
// TODO možnost dávat si příspěvky do oblíbených
// !! nezapomenout na LazyLoad componentu <LazyLoadImage/> umí i lazyload component
// TODO přechod na článek a zobrazení obrázků

const NewsPage = ({ history }) => {
  const { currentUserData } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [uploadImages, setUploadImages] = useState(null);
  const [posts, setPosts] = useState(null);
  const [text, setText] = useState("<p>React is really <em>nice</em>!</p>");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (event) => {
    // !! když se přiloží obr a rychle klikne submit tak jestě není reference v useState
    // !! udělat disable na submit než se vytvoří objekt v useState
    handleClose();
    event.preventDefault();
    const { title, category } = event.target.elements;
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
      (uploadImages && uploadImages.med && uploadImages.med.name) || "";
    const imgType =
      (uploadImages && uploadImages.med && uploadImages.med.type) || "";
    firebaseService
      .createPost(
        text,
        imgName,
        imgType,
        usrname,
        created,
        title.value,
        usrId,
        category.value
      )
      .then(() =>
        firebaseService.createImage(uploadImages).then(() => {
          setUploadImages(null);
          setText(null);
          init();
        })
      );
  };

  const onEditorChange = (evt) => {
    setText(evt.editor.getData());
  };

  const handleChange = (changeEvent) => {
    setText(changeEvent.target.value);
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
      // const optionsMax = {
      //   maxSizeMB: 1,
      //   maxWidthOrHeight: 800,
      //   useWebWorker: true,
      // };

      const optionsMed = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const optionsMin = {
        maxSizeMB: 1,
        maxWidthOrHeight: 100,
        useWebWorker: true,
      };

      try {
        let o;
        // await imageCompression(file, optionsMax).then((blob) => {
        //   o = { ...o, max: { blob, name, type, size: 800 } };
        // });
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
        // toto vyjmuto ze zakomentovanýho bloku dole
        setPosts({ ...posts, ...ww });

        // TODO toto refaktorovat je to zdvojený v fetchMorePosts
        // !! tato logika se bude hodit pro načítání v obrázků po otevření článku
        // const addImagetoPost = async (postKey, postValue) => {
        //   if (postValue.image) {
        //     let promise = firebaseService.getImageUrl(
        //       postValue.image,
        //       400,
        //       postValue.type
        //     );
        //     let response = await promise;
        //     ww = { ...ww, [postKey]: { ...ww[postKey], imageUrl: response } };
        //   }
        //   setPosts({ ...posts, ...ww });
        // };
        // addImagetoPost(childSnapshot.key, childSnapshot.val());
      });
    });
  };

  const fetchMorePosts = async (timeStamp) => {
    let ww = {};
    firebaseService.getPostsLimited(timeStamp).once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };
        // toto vyjmuto ze zakomentovanýho bloku dole
        setPosts({ ...posts, ...ww });

        // TODO toto refaktorovat je to zdvojený v init
        // const addImagetoPost = async (postKey, postValue) => {
        //   if (postValue.image) {
        //     let promise = firebaseService.getImageUrl(
        //       postValue.image,
        //       400,
        //       postValue.type
        //     );
        //     let response = await promise;
        //     ww = { ...ww, [postKey]: { ...ww[postKey], imageUrl: response } };
        //   }
        //   setPosts({ ...posts, ...ww });
        // };
        // addImagetoPost(childSnapshot.key, childSnapshot.val());
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
            <div
              className="news-page_post"
              onClick={() => changeRoute(postKey)}
            >
              <div className="news-page_header">
                <div className="news-page_post-icon">
                  <img
                    src={`/${postValue.category}.svg`}
                    height="30px"
                    width="30px"
                    alt={`${postValue.category} icon`}
                  ></img>
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
                id={`{postKey}-post-text`}
                className="news-page_post-text"
                dangerouslySetInnerHTML={{ __html: postValue.text }}
              ></div>
              <div className="news-page_post-text-overlay">
                <img src="/comment.svg" height="15px" width="15px"></img>
                <img src="/right.svg" height="15px" width="15px"></img>
              </div>
            </div>
          </>
        ))}
      </InfiniteScroll>
    );
  };

  const changeRoute = (postKey) => {
    history.push(`/post/${postKey}`);
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
              <CKEditor
                data={text}
                onChange={onEditorChange}
                config={ckEditorConfig}
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
