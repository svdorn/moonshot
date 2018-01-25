'use strict'
var express = require('express');
var app = express();
var path = require('path');


//middleware to define folder for static files
app.use(express.static('public'))

app.get('*', function(req, res){
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

app.listen(8081, function() {
  console.log("LISTENING ON PORT 8081");
})
