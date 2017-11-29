"use strict"

import { combineReducers } from 'redux';

// import reducers to be combineReducers
import { booksReducers } from './booksReducers';
import { cartReducers } from './cartReducers';

// comine the reducers
export default combineReducers({
  books: booksReducers,
  cart: cartReducers
})
