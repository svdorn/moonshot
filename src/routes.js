'use strict'
import React from 'react';
import { render } from 'react-dom';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory } from 'react-router';


import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Main from './main';
import Home from './components/pages/home';
import Content from './components/pages/content';
import Profile from './components/pages/profile';
import Settings from './components/pages/settings';
import VerifyEmail from './components/pages/verifyEmail';
import ForgotPassword from './components/pages/forgotpassword';
import ChangePassword from './components/pages/changepasswordforgot';

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
        <IndexRoute component={Home} />
        <Route path ='/login' component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/sandbox" component={Content} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/verifyEmail" component={VerifyEmail} />
        <Route path="/forgotPassword" component={ForgotPassword}/>
        <Route path="/changePassword" component={ChangePassword} />
    </Route>
  </Router>
);

export default routes;
