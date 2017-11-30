'use strict'
import React from 'react';
import { render } from 'react-dom';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory, hashHistory } from 'react-router';


import Login from './components/pages/login';
import Signup from './components/pages/signup';
import UsersList from './components/pages/usersList'
import Cart from './components/pages/cart';
import UsersForm from './components/pages/usersForm';
import Main from './main';

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={UsersList} />
      <Route path="/about" component={UsersList} />
      <Route path="/admin" component={UsersForm} />
      <Route path="/cart" component={Cart} />
        <Route path ='/login' component={Login} />
        <Route path="/signup" component={Signup} />
    </Route>
  </Router>
)

export default routes;
