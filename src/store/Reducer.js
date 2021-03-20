export const initialState = {
  selectedPost: null,
};

const Reducer = (state, action) => {
  switch (action.type) {
    case "ADD_SELECTED_POST":
      return {
        ...state,
        selectedPost: { ...action.payload },
      };

    default:
      return state;
  }
};

export default Reducer;
