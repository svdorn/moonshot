'use strict'
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

// import combined reducers
import reducers from './reducers/index';
import Menu from './components/menu';
import Footer from './components/footer';

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