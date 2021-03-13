import { ADD_POST } from "./actionTypes";

export const addPost = (content) => ({
  type: ADD_POST,
  payload: {
    content,
  },
});
