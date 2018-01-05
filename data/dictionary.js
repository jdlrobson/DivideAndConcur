var fs = require('fs');

var words = {};
var difficulty = {};
var decompositions = {};
const DICTIONARY_FILE = './data/dictionary.json';
const DictionaryUtils = require( './DictionaryUtils' );

var utils; // will be defined on load

function decompose(word) {
  return utils.decompose( word );
}
function translate(word) {
	return utils.translate( word );
}

function getDifficultyRating(word) {
	return utils.getDifficultyRating( word );
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
	return utils.getWords( wordLength, difficultyLevel, max );
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
			utils = new DictionaryUtils( words, decompositions, difficulty );
			resolve(words);
		} );
	})
}

function save() {
	return new Promise((resolve) => {
    // update the utils
		utils = new DictionaryUtils( words, decompositions, difficulty );
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
	return utils.getWord( word );
}

function addDecomposition( char, components ) {
	decompositions[char] = components;
	save();
}

function getDecompositions() {
	return utils.getDecompositions();
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
