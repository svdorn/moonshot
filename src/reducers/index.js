"use strict"

import { combineReducers } from 'redux';

// import reducers to be combineReducers
import { usersReducers } from './usersReducers';

// comine the reducers
export default combineReducers({
  users: usersReducers,
})
