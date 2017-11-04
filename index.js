var express = require('express');
var fs = require('fs');
var path = require('path');

var dict = require('./data/dictionary');

var app = express()
app.use(express.static('dist'))

app.get('/data/:size/:difficulty', function (req, res) {
  dict.load().then((dictionary) => {
    // get 10 words of length size
    let words = dict.getWords(parseInt(req.params.size, 10), parseInt(req.params.difficulty, 10)).
      // jumble up
      sort(()=>Math.random() < 0.5 ? -1 : 1);

    let data = {};
    words.forEach((word) => {
      data[word] = dictionary[word];
    })
    res.send( data );
  });
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
