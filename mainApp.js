require('babel-core/register')({
  "presets":["es2015", "react", "stage-1"]
})
// IF ANYTHING WITH CSS FILES IS EVER MESSED UP IT MAY BE BECAUSE OF THIS
// this fixes the problem of css files not being able to be imported into
// components directly
require.extensions['.css'] = () => {
  return;
};

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

//PROXY
var httpProxy = require('http-proxy');
// REQUEST HANDLER FOR SERVER-SIDE RENDERING
var requestHandler = require('./requestHandler.js');

var app = express();

//PROXY TO API
const apiProxy = httpProxy.createProxyServer({
  target: "http://localhost:3001"
});
app.use("/api", function(req, res) {
  apiProxy.web(req, res);
})
// END PROXY

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(requestHandler);

app.enable('trust proxy');
app.use (function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});


app.use(function(req, res, next) {
// catch 404 and forward to error handler
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
