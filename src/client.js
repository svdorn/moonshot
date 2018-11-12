'use strict'

// if not on https, redirect to https
const protocolLength = window.location.protocol.length;
const url = window.location.href;
let resourceName = "";
if (url.length > protocolLength + 11)  {
    resourceName = window.location.href.substring(protocolLength + 2, protocolLength + 11);
}
const shouldRedirectToHttps = location.protocol != 'https:' && resourceName !== "localhost";
if (shouldRedirectToHttps) {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';

import { applyMiddleware, createStore } from 'redux';
//import logger from 'redux-logger';
import thunk from 'redux-thunk';
import {StripeProvider} from 'react-stripe-elements';


// import combined reducers
import reducers from './reducers/index';

import routes from './routes'

if (!shouldRedirectToHttps) {
    let stripe_pk = "pk_test_7AHdmETWVxOeyDARcZfeWuZl";
    if (window.location.hostname !== "localhost") {
        stripe_pk = "pk_live_UC72NJ4kPiHRmMM5c7cc7U63";
    }
    // STEP 1 create the store
    const middleware = applyMiddleware(thunk);
    // WE WILL PASS INITIAL STATE FROM SERVER STORE
    const initialState = window.INITIAL_STATE;
    const store = createStore(reducers, initialState, middleware);

    const Routes = (
      <Provider store={store}>
          {routes}
      </Provider>
    )

    hydrate(
      <StripeProvider apiKey={stripe_pk}>{Routes}</StripeProvider>, document.getElementById('app')
    );
}
