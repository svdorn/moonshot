"use strict"

import { combineReducers } from 'redux';

// import reducers to be combineReducers
import { usersReducers } from './usersReducers';
import { imageReducers } from './imageReducers';
import { reducer as reducerForm } from 'redux-form';

// comine the reducers
export default combineReducers({
    form: reducerForm,
    users: usersReducers
})
