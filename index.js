var express = require('express');
var fs = require('fs');
var path = require('path');
var fetch = require('node-fetch');
var mcs = require('./mcs');

var dict = require('./data/dictionary');
var PORT = process.env.PORT ? parseInt( process.env.PORT, 10) : 3000;
var app = express()
app.use(express.static('dist'))

var loadedDictionary = dict.load();

app.get('/summarize/:character', function (req, res) {
  return mcs.getPronounciation(req.params.character).then((text) => {
    res.send( { text: text } );
  });
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
});
