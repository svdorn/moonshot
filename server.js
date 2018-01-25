'use strict'
var express = require('express');
var app = express();
var path = require('path');


//middleware to define folder for static files
app.use(express.static('public'))

app.use(function(req, res, next) {
    if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
    }
    else
        next();
});

app.get('*', function(req, res){
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.listen(8081, function() {
  console.log("LISTENING ON PORT 8081");
})
