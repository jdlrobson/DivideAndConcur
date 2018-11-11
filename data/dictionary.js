var fs = require('fs');

var words = {};
var difficulty = {};
var decompositions = {};
var pinyin = {};
const DICTIONARY_FILE = './data/dictionary.json';
const DictionaryUtils = require( './DictionaryUtils' );

var utils; // will be defined on load

function all() {
	return utils.all();
}

function atoZify(str) {
    return str.replace(/[āǎáǎà]/g, 'a').replace(/[īìǐìí]/g, 'i')
        .replace(/[úùūùǔ]/g, 'u')
        .replace(/[ǒōóò]/g, 'o').replace(/[ēèéě]/g, 'e');
}
function lookupPinyin(pinyinPhrase) {
    return Object.keys(pinyin).filter(
        key => atoZify(pinyin[key]).match(pinyinPhrase)
    ).map(char => [ char, pinyin[char], words[char] ]);
}
function decompose(word) {
  return utils.decompose( word );
}
function translate(word) {
	return utils.translate( word );
}

function getDifficultyRating(word, forWordAlone) {
	return utils.getDifficultyRating( word, forWordAlone );
}

function rateWord(word, rating) {
	difficulty[word] = rating;
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

function reload() {
	utils = new DictionaryUtils( words, decompositions, difficulty, pinyin );
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
				pinyin = data.pinyin || {};
			} else {
				words = data;
			}
			reload();
			resolve(words);
		} );
	})
}

function save() {
	return new Promise((resolve) => {
		// update the utils
		reload();
		const modified = new Date();
		const total = Array.from(new Set(Array.from(Object.keys(words).join()))).length;
		console.log(`${total} characters saved to dictionary.`);
		fs.writeFile(DICTIONARY_FILE,
			JSON.stringify({ words, decompositions, difficulty, modified, pinyin, total }),
			function( err ) {
				if ( !err ) {
					resolve();
				}
			}
		);
	});
}

function removeWord( chinese ) {
	const exists = Boolean(words[chinese]);
	delete words[chinese];
	return exists;
}

function saveWord( chinese, english ) {
	return new Promise((resolve) => {
		if ( chinese && english ) {
			words[chinese] = english;
			resolve();
		} else {
			resolve();
		}
	});
}

/**
 * Return any words that when decomposed contain this character
 * e.g. 火 is used by 烟
 * are contained inside 2 character words e.g. 山 in 火山
 */
function usedBy(char) {
	return utils.usedBy(char);
}

function getPinyin(word) {
	return utils.getPinyin( word );
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

function missing() {
	return utils.missing();
}

function getWordLength(w) {
	return utils.getWordLength(w);
}
function savePinyin(word, pin) {
	pinyin[word] = pin;
}
function deletePinyin(word, pin) {
	delete pinyin[word];
}

module.exports = {
	deletePinyin,
	missing,
	getWordLength,
	getPinyin,
	all,
	reload,
	usedBy,
	removeWord,
	savePinyin,
	lookupPinyin,
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
