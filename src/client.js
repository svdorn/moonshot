'use strict'

// if not on https, redirect to https
const protocolLength = window.location.protocol.length;
const url = window.location.href;
let resourceName = "";
if (url.length > protocolLength + 11)  {
    resourceName = window.location.href.substring(protocolLength + 2, protocolLength + 11);
}
if (location.protocol != 'https:' && resourceName !== "localhost") {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}


import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { applyMiddleware, createStore } from 'redux';
//import logger from 'redux-logger';
import thunk from 'redux-thunk';


// import combined reducers
import reducers from './reducers/index';

// STEP 1 create the store
const middleware = applyMiddleware(thunk);
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
