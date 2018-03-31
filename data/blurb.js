const fs = require('fs');
const JSON_FILE = 'data/blurbs.json';
const json = JSON.parse(String(fs.readFileSync(JSON_FILE)));

function getBlurb(char) {
	return json[char] || '';
}

function addBlurb(char, blurb) {
	json[char] = blurb;
}

function getBlurbJSONString() {
	return JSON.stringify(json);
}

module.exports = {
	getBlurbJSONString,
	addBlurb,
	JSON_FILE,
	getBlurb
};
