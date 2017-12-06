"use strict"
var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
  name: String,
  email: String,
  username: String,
  userType: String,
  password: String,
  verificationToken: String,
  verified: Boolean,
  images: String
});

// 'Users' means we will use the 'users' collection. if 'Books' was in there
// it would be using the books collection from the db
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
