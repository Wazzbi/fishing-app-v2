import React from "react";
import "./App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./components/homePage/HomePage";
import Login from "./components/login/Login";
import SignUp from "./components/signUp/SignUp";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import LandingPage from "./components/landingPage/LandingPage";
import Navigation from "./components/navigation/Navigation";
import RecordPage from "./components/recordPage/RecordPage";
import SummaryPage from "./components/summaryPage/SummaryPage";
import NewsPage from "./components/newsPage/NewsPage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />

          <Route exact path="/" component={LandingPage} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <PrivateRoute exact path="/home" component={HomePage} />
          <PrivateRoute exact path="/record" component={RecordPage} />
          <PrivateRoute exact path="/summary" component={SummaryPage} />
          <PrivateRoute exact path="/news" component={NewsPage} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
