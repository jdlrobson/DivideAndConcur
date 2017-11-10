var fs = require('fs');

var words = {};
var difficulty = {};
var decompositions = {};
const DICTIONARY_FILE = './data/dictionary.json';

function decompose(word) {
	var parts = [];
	Array.from(word).forEach((radical) => {
		var decomp = decompositions[radical];
		if ( !decomp ) {
			// no decompositions possible, have reached smallest unit
			parts.push(radical);
		} else {
			// this radical itself is composed of different parts
			Array.from( decomp ).forEach((decomposedRadical) => {
				var _decomposition = decompose( decomposedRadical );
				parts = parts.concat( decompose( decomposedRadical ) );
			});
		}
	});
	return parts;
}
function translate(word) {
	var translation = getWord(word) || '?';
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
				// can it be decomposed further?
				if ( decompositions[radical] ) {
					c.push( translate( radical ) );
				} else {
					c.push( words[radical] );
				}
			} else {
				if ( decompositions[radical] ) {
					c.push( translate(radical) );
				} else {
					c.push( '?' );
				}
			}
		});
		composition = ' (' + c.join(' · ') + ')';
	}
	return translation + composition;
}

function getDifficultyRating(word) {
	return difficulty[word] || 0;
}

function rateWord(word, rating) {
	difficulty[word] = rating;
	return save();
}

/**
 * @param {Number} wordLength (character length) to restrict words to. If word length is zero
 * it will be assumed you want to obtain radicals.
 * Only words which do not have decompositions will be shown.
 * If wordLength is 1 single characters which have not been decomposed will be shown
 * For all other word counts we assume that each character can be decomposed.
 * @param {Number} [difficultyLevel] if defined results will be limited to this difficulty level
 * @param {Number} [max] if defined results will be limited to this amount of results.
 */
function getWords(wordLength, difficultyLevel, max) {
	function matchesDifficultyLevel(w) {
		return difficultyLevel === undefined || getDifficultyRating(w) === difficultyLevel
	}
	var keys = Object.keys( words ).filter((w) => {
			// 1 character long cannot be decomposed
			if ( wordLength === 0 && w.length === 1 ) {
				// only return words without known decompositions (radicals)
				return !decompositions[w] && matchesDifficultyLevel(w);
			// one character long can be decomposed to two parts
			} else if ( wordLength === 1 && w.length === 1 ) {
				// only return words of length 1 if they have decompositions
				return decompose(w).length === 2 && matchesDifficultyLevel(w);
			} else {
				return w.length === wordLength && matchesDifficultyLevel(w);
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
				difficulty = data.difficulty || {};
			} else {
				words = data;
			}
			words._decompositions = decompositions;
			words._difficulty = difficulty;
			resolve(words);
		} );
	})
}

function save() {
	return new Promise((resolve) => {
		fs.writeFile(DICTIONARY_FILE,
			JSON.stringify({ words: words, decompositions: decompositions, difficulty: difficulty }),
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

function getDecompositions() {
	return decompositions;
}

module.exports = {
	getDecompositions: getDecompositions,
	decompose: decompose,
	rateWord: rateWord,
	getDifficultyRating: getDifficultyRating,
	addDecomposition: addDecomposition,
	getWord: getWord,
	saveWord: saveWord,
	save: save,
	load: load,
	translate: translate,
	getWords: getWords
};
