import React from "react";
import "./App.scss";
import { HashRouter, Route, Redirect } from "react-router-dom";
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
import SettingPage from "./pages/settingPage/SettingPage";
import PostPage from "./pages/postPage/PostPage";
import Store from "./store/Store";
import ForgotPasswordPage from "./pages/forgotPasswordPage/ForgotPasswordPage";
import TitleArticle from "./pages/onePage/TitleArticle";
import PartnerArticle from "./pages/onePage/PartnerArticle";
import ActualArticle from "./pages/onePage/ActualArticle";

// TODO localStorage je hnusně na každé stránce - určitě to jde udělat globálně

const App = () => {
  return (
    <>
      <AuthProvider>
        <HashRouter>
          <div>
            <Store>
              <Navigation />

              <Route exact path="/" component={LandingPage} />
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/signup" component={SignUpPage} />
              <Route
                exact
                path="/forgotPassword"
                component={ForgotPasswordPage}
              />
              <PrivateRoute exact path="/home" component={HomePage} />
              <PrivateRoute exact path="/record" component={RecordPage} />
              <PrivateRoute exact path="/summary" component={SummaryPage} />
              <PrivateRoute exact path="/news" component={NewsPage} />
              <PrivateRoute exact path="/post/:id" component={PostPage} />
              <PrivateRoute
                exact
                path="/titleArticle"
                component={TitleArticle}
              />
              <PrivateRoute
                exact
                path="/partnerArticle"
                component={PartnerArticle}
              />
              <PrivateRoute
                exact
                path="/actualArticle"
                component={ActualArticle}
              />
              <PrivateRoute exact path="/user" component={UserPage} />
              <PrivateRoute exact path="/weather" component={WeatherPage} />
              <PrivateRoute exact path="/settings" component={SettingPage} />
              <Redirect from="*" to="/" />
            </Store>
          </div>
        </HashRouter>
      </AuthProvider>
    </>
  );
};

export default App;
