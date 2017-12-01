'use strict'
import React from 'react';
import { render } from 'react-dom';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory } from 'react-router';


import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Main from './main';

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
        <Route path ='/login' component={Login} />
        <Route path="/signup" component={Signup} />
    </Route>
  </Router>
)

export default routes;
