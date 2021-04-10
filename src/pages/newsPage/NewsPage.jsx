import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import "./newsPage.scss";
import firebaseService from "../../services/firebase/firebase.service";

import "react-lazy-load-image-component/src/effects/opacity.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthContext } from "../../Auth";

import { StoreContext } from "../../store/Store";

import AddPost from "./components/addPost/AddPost";
import ReportPost from "./components/reportPost/ReportPost";
import Post from "./components/post/Post";

import Button from "react-bootstrap/Button";
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [uploadImages, setUploadImages] = useState([]);
  const [inputImageFieldCounter, setInputImageFieldCounter] = useState(1);
  const [text, setText] = useState("");
  const [storeState, dispatch] = useContext(StoreContext);
  const [postCount, setPostCount] = useState(null);
  const [uploadPostDone, setUploadPostDone] = useState(true);
  const [reportedPostId, setReportedPostId] = useState(null);

  const isMountedRef = useRef(true);

  const handleReport = (reportCategory, reportText) => {
    // TODO ulož meta data o reportu do postu
    // TODO ulož meta data o reportu do dat nahlašovatele aby měl disabled alert na tento post (nebo ho odstranit z obrazovky)
    // find reported post in store
    const _post = Object.entries(storeState.posts).find(
      ([postKey, postValue]) => +postKey === +reportedPostId
    );

    // id of reported pos
    const reportedPost = _post[0];

    // continue with postValue only
    const post = _post[1];

    // add report flag podle tohoto zobrazovat příspěvek v admin konzoly
    post.reportedFlag = true;
    // add report metadata
    post.reports = post.reports ? post.reports : [];
    post.reports = [
      ...post.reports,
      {
        reportCreated: Date.now(),
        reportedBy: currentUserData.id,
        reportCategory,
        reportText,
      },
    ];

    // add report data to userData
    currentUserData.reportsCreated = currentUserData.reportsCreated || [];
    currentUserData.reportsCreated.push({
      reportCreated: Date.now(),
      reportedPost,
    });

    // add report data to post
    firebaseService.setPost(post.timeStamp, post);
    // add report data to reporter
    firebaseService.setUserData(currentUserData.firebaseId, currentUserData);
  };

  const handleReportPost = (postKey) => {
    handleSetShowReportModal(true);
    setReportedPostId(postKey);
  };

  const handleSetShowReportModal = (newValue) => {
    setShowReportModal(newValue);
  };

  const handleSetPostCount = (newValue) => {
    setPostCount(newValue);
  };

  const handleSetUploadPostDone = (newValue) => {
    setUploadPostDone(newValue);
  };

  const handleSetText = (newValue) => {
    setText(newValue);
  };

  const handleSetInputImageFieldCounter = (newValue) => {
    setInputImageFieldCounter(newValue);
  };

  const handleSetUploadImages = (newValue) => {
    setUploadImages(newValue);
  };

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

  const init = useCallback(() => {
    let ww = {};
    firebaseService.getPostsInit().once("value", (snapshot) => {
      if (isMountedRef.current) {
        snapshot.forEach((childSnapshot) => {
          ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };

          // přidej titulní obrázek do objektu
          Object.entries(ww).map(([postKey, postValue]) => {
            if (postValue.images) {
              firebaseService
                .getImageUrl(
                  postValue.images[0].imageName,
                  400,
                  postValue.images[0].imageType
                )
                .then((imageUrl) => {
                  postValue.titleImage = imageUrl;

                  return dispatch({
                    type: "ADD_POSTS",
                    payload: { ...storeState.posts, ...ww },
                  });
                });
            }
          });

          return dispatch({
            type: "ADD_POSTS",
            payload: { ...storeState.posts, ...ww },
          });
        });
      }
    });
  }, [dispatch, storeState.posts]);

  const fetchMorePosts = async (lastPostTimeStamp) => {
    let ww = {};
    await firebaseService
      .getPostsLimited(lastPostTimeStamp)
      .once("value", (snapshot) => {
        if (isMountedRef.current) {
          snapshot.forEach((childSnapshot) => {
            ww = { ...ww, [childSnapshot.key]: childSnapshot.val() };

            // přidej titulní obrázek do objektu
            Object.entries(ww).map(([postKey, postValue]) => {
              if (postValue.images) {
                firebaseService
                  .getImageUrl(
                    postValue.images[0].imageName,
                    400,
                    postValue.images[0].imageType
                  )
                  .then((imageUrl) => {
                    postValue.titleImage = imageUrl;

                    return dispatch({
                      type: "ADD_POSTS",
                      payload: { ...storeState.posts, ...ww },
                    });
                  });
              }

              return dispatch({
                type: "ADD_POSTS",
                payload: { ...storeState.posts, ...ww },
              });
            });
          });
        }
      });
  };

  // https://www.npmjs.com/package/react-lazy-load-image-component
  // https://www.npmjs.com/package/react-infinite-scroll-component
  const renderPosts = () => {
    let t = Object.entries(storeState.posts); // [[postKey,postValue], ...]
    let postsRender = t.sort().reverse();

    let lastPost = postsRender[postsRender.length - 1];
    let lastPostTimeStamp = lastPost[1].timeStamp;

    return (
      <InfiniteScroll
        style={{ overflow: "hidden" }}
        dataLength={postsRender.length}
        next={() => fetchMorePosts(lastPostTimeStamp)}
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
        refreshFunction={init}
        pullDownToRefresh
        pullDownToRefreshThreshold={50}
        pullDownToRefreshContent={
          <p style={{ textAlign: "center" }}>
            <b>&#8595; Tahej ještě trochu</b>
          </p>
        }
        releaseToRefreshContent={
          <p style={{ textAlign: "center" }}>
            <b>&#8593; Už mě pusť</b>
          </p>
        }
      >
        {
          // odfiltrování reportovaných postů daného uživatele aby na ně nemusel koukat když se mu nelíbí
          postsRender
            .filter(
              ([postKey, postValue]) =>
                currentUserData &&
                !currentUserData.reportsCreated.find(
                  (r) => +r.reportedPost === +postKey
                )
            )
            .map(([postKey, postValue]) => (
              <Post
                key={`post-${postKey}`}
                postKey={postKey}
                postValue={postValue}
                handleChangeRoute={handleChangeRoute}
                handleReportPost={handleReportPost}
              />
            ))
        }
      </InfiniteScroll>
    );
  };

  const handleChangeRoute = (postKey) => {
    dispatch({ type: "ADD_SELECTED_POST", payload: storeState.posts[postKey] });
    history.push(`/post/${postKey}`);
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

      <AddPost
        show={show}
        handleClose={handleClose}
        inputImageFieldCounter={inputImageFieldCounter}
        handleSetInputImageFieldCounter={handleSetInputImageFieldCounter}
        uploadImages={uploadImages}
        handleSetUploadImages={handleSetUploadImages}
        text={text}
        handleSetText={handleSetText}
        isMountedRef={isMountedRef}
        handleSetUploadPostDone={handleSetUploadPostDone}
        init={init}
        handleSetPostCount={handleSetPostCount}
        currentUserData={currentUserData}
      />

      <ReportPost
        show={showReportModal}
        handleClose={handleSetShowReportModal}
        isMountedRef={isMountedRef}
        currentUserData={currentUserData}
        handleReport={handleReport}
      />
    </>
  );
};

export default NewsPage;
