import React from "react";
import Jdenticon from "react-jdenticon";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ClampLines from "react-clamp-lines";

const Post = ({ postKey, postValue, handleChangeRoute, handleReportPost }) => {
  return (
    <>
      <div key={postKey} className="news-page_post">
        <div onClick={() => handleChangeRoute(postKey)}>
          <div className="news-page_header">
            <div className="news-page_header-title">
              <div className="news-page_header-title-first-row">
                <Jdenticon
                  size="30"
                  value={postValue.userId.toString() || ""}
                />
                <small>
                  {postValue.username} {" | "} {postValue.created}
                </small>
              </div>
              <span>
                <strong>{postValue.title}</strong>
              </span>
            </div>
          </div>

          <div className="news-page_post-text-wrapper">
            <div id={`${postKey}-post-text`} className="news-page_post-text">
              <ClampLines
                text={postValue.text}
                id="really-unique-id"
                lines={4}
                ellipsis="..."
                moreText="Expand"
                lessText="Collapse"
                buttons={false}
                className="custom-class"
                innerElement="p"
              />
            </div>
          </div>

          {postValue && postValue.titleImage && (
            <LazyLoadImage
              alt=""
              effect="opacity"
              delayTime="0"
              threshold="400"
              src={postValue.titleImage}
              className="news-page_lazyLoadImage"
            />
          )}
        </div>

        <div className="news-page_post-footer">
          <div className="news-page_post-footer-icon-group-left">
            <img src="/comment.svg" alt="" height="16px" width="16px"></img>
            <span style={{ color: "#808080" }}>1526</span>
            <img src="/heart.svg" alt="" height="16px" width="16px"></img>
            <span style={{ color: "#808080" }}>99.1k</span>
          </div>
          <div className="news-page_post-footer-icon-group-right">
            <img src="/bookmark.svg" alt="" height="16px" width="16px"></img>
            <img
              src="/report.svg"
              alt=""
              height="16px"
              width="16px"
              onClick={() => handleReportPost(postKey)}
            ></img>
            <img src="/right.svg" alt="" height="16px" width="15px"></img>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
