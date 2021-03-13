import { ADD_POST } from "../actionTypes";

const initialState = {
  selectedPost: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_POST: {
      const { content } = action.payload;
      return {
        ...state,
        selectedPost: content,
      };
    }
    default:
      return state;
  }
}
