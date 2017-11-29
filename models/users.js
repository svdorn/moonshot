"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
  username: String,
  userType: String,
  images: String,
  price: Number
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
