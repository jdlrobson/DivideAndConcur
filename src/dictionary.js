var fs = require('fs');

var words = {};
var decompositions = {};
const DICTIONARY_FILE = 'dictionary.json';

function translate(word) {
	var translate = getWord(word);
	var composition = '';
	var decomp;

	if ( word.length > 1 ) {
		decomp = word;
	} else {
		decomp = decompositions[word]
	}

	if ( decomp ) {
		var c = [];
		Array.from( decomp ).forEach((radical) => {
			if ( words[radical] ) {
				c.push( words[radical] );
			} else {
				c.push( '?' );
			}
		});
		composition = ' (' + c.join(' · ') + ')';
	}
	return translate + composition;
}

function getWords(wordLength, max) {
	var keys = Object.keys( words ).filter((w) => {
			if ( wordLength === 0 && w.length === 1 ) {
				return !decompositions[w];
			} else if ( wordLength === 1 && w.length === 1 ) {
				return decompositions[w];
			} else {
				return w.length === wordLength;
			}
		} );
	return keys.slice( 0, max );
}

function load() {
	return new Promise((resolve) => {
		fs.readFile(DICTIONARY_FILE, ( err, data ) => {
			if ( !err ) {
				data = JSON.parse(data);
			}
			if ( data.words ) {
				words = data.words;
				decompositions = data.decompositions;
			} else {
				words = data;
			}
			resolve(words, decompositions);
		} );
	})
}

function save() {
	return new Promise((resolve) => {
		fs.writeFile(DICTIONARY_FILE,
			JSON.stringify({ words: words, decompositions: decompositions }),
			function( err ) {
				if ( !err ) {
					resolve();
				}
			}
		);
	});
}

function saveWord( chinese, english ) {
	return new Promise((resolve) => {
		if ( chinese && english ) {
			words[chinese] = english;
			save().then(() => resolve());
		} else {
			resolve();
		}
	});
}

function getWord(word) {
	return words[word];
}

function addDecomposition( char, components ) {
	decompositions[char] = components;
}

module.exports = {
	addDecomposition: addDecomposition,
	getWord: getWord,
	saveWord: saveWord,
	save: save,
	load: load,
	translate: translate,
	getWords: getWords
};
