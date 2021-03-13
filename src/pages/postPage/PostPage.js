import React, { useEffect, useContext } from "react";

const PostPage = (props) => {
  const params = props.match.params;

  //   useEffect(() => {
  //     init();
  //   }, []);

  return (
    <>
      <h1>postPage</h1>
      <p>{params.id}</p>
    </>
  );
};

export default PostPage;
