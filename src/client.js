'use strict'
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

//REACT_ROUTER
import { Router, Route, IndexRoute, browserHistory, hashHistory } from 'react-router';

import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

// import combined reducers
import reducers from './reducers/index';
// import actions
import { addToCart } from './actions/cartActions';
import { postUser, deleteUser, updateUser } from './actions/usersActions';

// STEP 1 create the store
const middleware = applyMiddleware(thunk, logger);
// WE WILL PASS INITIAL STATE FROM SERVER STORE
const initialState = window.INITIAL_STATE;
const store = createStore(reducers, initialState, middleware);

import routes from './routes'
const Routes = (
  <Provider store={store}>
    {routes}
  </Provider>
)

render(
  Routes, document.getElementById('app')
);
