var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const credentials = require('./credentials');
var bcrypt = require('bcrypt');


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// APIs
var mongoose = require('mongoose');
// MONGO LAB - OLD
//mongoose.connect('mongodb://testUser:test@ds111476.mlab.com:11476/bookshop')
// MONGO LAB - NEW
const dbConnectLink = 'mongodb://' + credentials.dbUsername + ':' + credentials.dbPassword + '@ds125146.mlab.com:25146/testmoonshot'
mongoose.connect(dbConnectLink);
// LOCAL DB
//mongoose.connect('mongodb://localhost:27017/bookshop');


var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));
// --->>> SET UP SESSIONS <<<---
app.use(session({
  secret: 'mySecretString',
  saveUninitialized: false,
  resave: false,
  cookie: {maxAge: 1000*60*60*24*2}, //2 days in milliseconds
  store: new MongoStore({mongooseConnection: db, ttl: 2*24*60*60})
  // ttl: 2 days * 24 hours * 60 minutes * 60 seconds
}));
// SAVE SESSION CART API
app.post('/cart', function(req, res) {
  var cart = req.body;
  req.session.cart = cart;
  req.session.save(function(err) {
    if (err) {
      console.log(err);
    }
    res.json(req.session.cart);
  })
})
// GET SESSION CART API
app.get('/cart', function(req, res) {
  if (typeof req.session.cart !== 'undefined') {
    res.json(req.session.cart);
  }
})
// --->>> END SESSION SET UP <<<---

var Users = require('./models/users.js');

//----->> POST USER <<------
app.post('/users', function(req, res) {
  var user = req.body[0];

  // hash the user's password
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
        // change the stored password to be the hash
        user.password = hash;

        // store the user in the db
        Users.create(user, function(err, user) {
          if (err) {
            console.log(err);
          }
          res.json(user);
        })
    });
  });
});

// LOGIN USER
app.get('/login', function(req, res) {
    var user = req.body;
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
          var query = {username: user.username, password: hash}

          Users.find(query, function(err, user) {
              if (err) {
                  console.log(err);
              }
          res.json(user);
        })
      });
    });
});

//----->> GET USERS <<------
app.get('/users', function(req, res) {
  Users.find(function(err, users) {
    if (err) {
      console.log(err);
    }
    res.json(users);
  })
});

//----->> DELETE USER <<------
app.delete('/users/:_id', function(req, res) {
  var query = {_id: req.params._id};

  Users.remove(query, function(err, user) {
    if (err) {
      console.log(err);
    }
    res.json(user);
  })
});

//----->> UPDATE USER <<------
app.put('/users/:_id', function(req, res) {
  var user = req.body;
  var query = req.params._id;

  // if the field doesn't exist, $set will set a new field
  var update = {
    '$set': {
      username: user.username,
      userType: user.userType,
      image: user.image,
      password: user.password,
      name: user.name,
      email: user.email
    }
  };

  // When true returns the updated document
  var options = {new: true};

  Users.findOneAndUpdate(query, update, options, function(err, users) {
    if (err) {
      console.log(err);
    }
    res.json(users);
  });
});

//----->> GET USER IMAGES <<------
app.get('/images', function(req, res) {
  const imgFolder = __dirname + '/public/images/';
  // REQUIRE FILE SYSTEM
  const fs = require('fs');
  // READ ALL FILES IN THE DIRECTORY
  fs.readdir(imgFolder, function(err, files) {
    if (err) {
      return console.error(err);
    }
    //CREATE AN EMPTY ARRAY
    const filesArr = [];
    // ITERATE ALL IMAGES IN THE DIRECTORY AND ADD TO THE ARRAY
    files.forEach(function(file) {
      filesArr.push({name: file});
    });
    // SEND THE JSON RESPONSE WITH THE ARRAY
    res.json(filesArr);
  })
})

// END APIs

app.listen(3001, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log('API Server is listening on http://localhost:3001');
})
