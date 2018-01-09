'use strict'
import React from 'react';
import { render } from 'react-dom';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory } from 'react-router';


import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Main from './main';
import Home from './components/pages/home';
import ForBusiness from './components/pages/forBusiness';
import Profile from './components/pages/profile';
import Settings from './components/pages/settings';
import VerifyEmail from './components/pages/verifyEmail';
import ForgotPassword from './components/pages/forgotpassword';
import ChangePassword from './components/pages/changepasswordforgot';
import Discover from './components/pages/discover';
import Pathway from './components/pages/pathway';
import PathwayContent from './components/pages/pathwayContent';
import ContactUs from './components/pages/contactUs';
import MyPathways from './components/pages/myPathways';
import Onboarding from './components/pages/onboarding';

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
        <IndexRoute component={Home} />
        <Route path ='/login' component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path ='/forBusiness' component={ForBusiness} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/verifyEmail" component={VerifyEmail} />
        <Route path="/forgotPassword" component={ForgotPassword}/>
        <Route path="/changePassword" component={ChangePassword} />
        <Route path="/discover" component={Discover} />
        <Route path="/contactUs" component={ContactUs} />
        <Route path="/myPathways" component={MyPathways} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/pathway/:_id" component={Pathway}/>
        <Route path="/pathwayContent/:_id" component={PathwayContent}/>
    </Route>
  </Router>
);

export default routes;
