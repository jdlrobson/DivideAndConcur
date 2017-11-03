var express = require('express');
var fs = require('fs');
var path = require('path');

var dict = require('./data/dictionary');

var app = express()
app.use(express.static('dist'))

app.get('/data', function (req, res) {
	dict.load().then((data) => {
		res.send( data );
	});
})

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
