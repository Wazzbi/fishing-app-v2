import { combineReducers } from "redux";
// import visibilityFilter from "./visibilityFilter"; takto jde přidat další sub store a pak přidat do objektu dole
import posts from "./posts";

export default combineReducers({ posts });
