import React, { createContext, useReducer } from "react";
import Reducer, { initialState } from "./Reducer";

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};

export const StoreContext = createContext(initialState);
export default Store;
