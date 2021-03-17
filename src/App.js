import React from "react";
import "./App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import HomePage from "./pages/homePage/HomePage";
import LoginPage from "./pages/loginPage/LoginPage";
import SignUpPage from "./pages/signUpPage/SignUpPage";
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import LandingPage from "./pages/landingPage/LandingPage";
import Navigation from "./navigation/Navigation";
import RecordPage from "./pages/recordPage/RecordPage";
import SummaryPage from "./pages/summaryPage/SummaryPage";
import NewsPage from "./pages/newsPage/NewsPage";
import UserPage from "./pages/userPage/UserPage";
import WeatherPage from "./pages/weatherPage/WeatherPage";
import PostPage from "./pages/postPage/PostPage";

// TODO redirect na landingpage kdyz zadané špatná cesta viz stará verze app v gitu
// TODO https://stackoverflow.com/questions/50266537/react-router-using-hash-url

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />

          <Route exact path="/" component={LandingPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/signup" component={SignUpPage} />
          <PrivateRoute exact path="/home" component={HomePage} />
          <PrivateRoute exact path="/record" component={RecordPage} />
          <PrivateRoute exact path="/summary" component={SummaryPage} />
          <PrivateRoute exact path="/news" component={NewsPage} />
          <PrivateRoute exact path="/post/:id" component={PostPage} />
          <PrivateRoute exact path="/user" component={UserPage} />
          <PrivateRoute exact path="/weather" component={WeatherPage} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
