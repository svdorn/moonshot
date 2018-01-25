'use strict'
var express = require('express');
var app = express();
var path = require('path');


//middleware to define folder for static files
app.use(express.static('public'))

app.get('*', function(req, res){
    res.redirect('https://www.moonshotlearning.org' + req.url);
})

app.listen(8081, function() {
  console.log("LISTENING ON PORT 8081");
})
