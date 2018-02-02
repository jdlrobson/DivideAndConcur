var util = require('util');
var dict = require('./data/dictionary');
const mcs = require('./src/mcs');
const htmlToText = require('html-to-text');
const chalk = require('chalk');
var fs = require('fs');
const strokeCount = require('./strokeCount' );
var hanzi = require("hanzi");
var hanziLoaded = false;

function addDictionaryItem() {
	return new Promise( ( resolve ) => {
		var chinese, english;
		getUserInput( 'Enter Chinese:' ).then( ( chinese ) => {
			getUserInput( 'Enter English:' ).then( ( english ) => {
				dict.saveWord( chinese, english )
				.then(()=>dict.save())
				.then(() => {
					resolve();
				});
			} );
		} );
	} );
}

function getUserInput( msg ) {
	return new Promise( ( resolve, reject ) => {
		feedback( msg, true );
		process.stdin.setEncoding('utf8');
		process.stdin.once('data', function (text) {
			resolve( util.inspect(text).replace( /'([^\n]*)'/g, '$1' ).replace( '\\n', '' ).trim() );
		});
	})
}

function deal(wordLength, max, _keys) {
	max = max || 10;
	if ( !_keys ) {
		_keys = dict.getWords(wordLength, undefined, max);
	}

	if ( _keys.length ) {
		var index = Math.floor(Math.random() * _keys.length);
		var word = _keys[index];
		_keys.splice( index, 1 );
		getUserInput('What is: ' + word + '?').then((answer) => {
			feedback( dict.translate(word) );
			deal( wordLength, max, _keys );
		});
	} else {
		game();
	}
}

function feedback( msg, bold ) {
	if ( bold ) {
		console.log( chalk.bold( msg ) );
	} else {
		console.log( '\t\t' + msg );
	}
}

function decomposeWord() {
	return new Promise( ( resolve ) => {
		var components = [];
		getUserInput('What is the Chinese word you want to decompose?').then((answer) => {

			getUserInput('What are the components (up to 2)?').then((radicals) => {
				const components = Array.from(radicals.trim().replace(/ /g, ''));
				if ( components.length && components.length <= 2 ) {
					dict.addDecomposition( answer, components );
					dict.save().then(()=>resolve());
				} else {
					console.log('No more than 2 radicals please.');
					resolve();
				}
			});
		});
	} );
}

function viewDecomposition() {
	return getUserInput('Enter chinese character to decompose').then((word) => {
		feedback( dict.decompose(word).join( '*' ) );
	} );
}
function translate() {
	return getUserInput('What is the Chinese word you want to translate?').then((answer) => {
		feedback( dict.translate(answer) );
	});
}

function changeDifficulty(delta) {
	return getUserInput('Enter chinese character(s) to change difficulty for (' + delta + ')')
		.then((word) => {
			Array.from(word).forEach((char) => {
				const diff = dict.getDifficultyRating(char, true) || 0;
				dict.rateWord(char, diff + delta);
				console.log(`${char} difficulty level = ${diff+delta}`)
			});
		} ).then(()=> {
			return dict.save();
		} );
}

function game() {
	const options = [
		'0: Back to menu',
		'1: Deal radicals',
		'2: Deal singles',
		'3: Deal double cards',
		'4: Deal triple cards'
	];
	return getUserInput( '**********************\n' + options.join('\n') + '\n**********************' )
		.then( ( val ) => {
			val = parseInt( val, 10 );
			switch ( val ) {
				case 0:
					menu();
					break;
				case 1:
					deal( 0 );
					break;
				case 2:
					deal( 1 );
					break;
				case 3:
					deal( 2 );
					break;
				case 4:
					deal( 3 );
					break;
				default:
					feedback('Huh?');
					game();
			}
		});
}

function batchAutoDecompose(words) {
	if ( !hanziLoaded ) {
		hanzi.start();
		hanziLoaded = true;
	}
	words.filter((char) => char.length === 1).forEach((char) => {
		const decomps = hanzi.decompose(char);
		const components = decomps.components1.filter((comp) =>
			comp !== 'No glyph available' );

		if ( ( components.length === 1 && components[0] !== char ) || components.length > 1 ) {
			const existingDecomps = dict.getDecompositions()[char] || [];
			if ( existingDecomps.length <= components.length ) {
				console.log('Add', char, components );
				dict.addDecomposition( char, components );
			}
		}
	})
}

function clean() {
	var mapper = {
		'⺮': '𥫗'
	};

	// Remove things that decompose to itself.
	const decomp = dict.getDecompositions();
	Object.keys(decomp).forEach((key) => {
		var parts = decomp[key];
		if ( parts.indexOf(key) > -1 ) {
			console.log(`${key} decomposes to itself`);
			parts.splice( parts.indexOf(key), 1 );
			decomp[key] = parts;
		}
		if ( Object.keys(mapper).indexOf(key) > -1 ) {
			console.log(`${key} is duplicated by ${mapper[key]}`);
			decomp[key] = [];
		}
		Object.keys(mapper).forEach((dupeKey) => {
			if ( parts.indexOf(dupeKey) > -1 ) {
				console.log(`Substituting ${dupeKey} with ${mapper[dupeKey]}`)
				parts[parts.indexOf(dupeKey)] = mapper[dupeKey];
			}
		})
	});
	Object.keys(decomp).forEach((key) => {
		var parts = decomp[key];
		if ( parts.length === 0 ) {
			console.log(`Empty decomposition for ${key}`);
			delete decomp[key];
		}
	});
}

function menu() {
	const options = [
		'1: Game',
		'2: Lookup word',
		'3: auto decompose difficulty level',
		'4: Lookup character',
		'5: Add to dictionary',
		'6: Batch decompose',
		'7: Decompose chinese word',
		'8: Decrease difficulty of word(s)',
		'9: Increase difficulty of word(s)',
		'10: Missing definitions',
		'11: Delete word',
		'12: Auto-assign difficulty',
		'13: Clean'
	];
	getUserInput( '**********************\n' + options.join('\n') + '\n**********************' )
		.then( ( val ) => {
			val = parseInt( val, 10 );
			switch ( val ) {
				case 4:
					getUserInput('Enter chinese character').then((msg) => {
						return mcs.getDefinition( msg )
					}).then((text)=> {
						console.log(htmlToText.fromString(text));
						return menu();
					});
					break;
				case 1:
					game();
					break;
				case 13:
					clean();
					return dict.save().then(() => menu());
					break;
				case 3:
					getUserInput('Enter difficulty level').then((msg) => {
						var words = dict.getWords(2,parseInt(msg, 10));
						batchAutoDecompose(words);
						return dict.save().then(() => menu());
					});
					break;
				case 6:
					getUserInput('Enter chinese character(s)').then((msg) => {
						var words = Array.from(msg.trim().replace(/ /g, ''))
						batchAutoDecompose(words);
						return dict.save().then(() => menu());
					});
					break;
				case 5:
					addDictionaryItem().then(() => menu());
					break;
				case 7:
					decomposeWord().then(() => menu());
					break;
				case 8:
					changeDifficulty(-1).then(()=>menu());
					break;
				case 2:
					getUserInput('Enter chinese character').then((char) => {
						feedback( `Character: ${char}` );
						feedback( `English: ${dict.getWord( char )}`)
						feedback( `Pinyin: ${dict.getPinyin( char )}`);
						feedback( `${dict.decompose( char ).join('+')}` );
						feedback( dict.translate(char) );
						feedback( `Standalone Difficulty=${dict.getDifficultyRating(char, true)}` );
						feedback( `True difficulty=${dict.getDifficultyRating(char)}` );
						feedback( `Length=${dict.getWordLength(char)}` );
					} ).then(() => menu());
					break;
					break;
				case 10:
					const missing = dict.missing();
					console.log( `There are ${missing.length} words missing definitions without decompositions` );
					console.log( missing.sort(()=>Math.random() > 0.5 ? -1 : 1 ).join('   ' ) );
					menu();
					break;
				case 9:
					changeDifficulty(1).then(()=>menu());
					break;
				case 11:
					getUserInput('Enter chinese character to remove').then((word) => {
						dict.removeWord(word);
						return menu()
					} );
					break;
				case 12:
					getUserInput('Enter chinese character to count strokes for').then((word) => {
						return rateWordsDifficultyByStrokeCount([word]).then(()=> menu());
					} );
					break
				default:
					feedback('Huh?');
					menu();
			}
		});
}

function rateWordsDifficultyByStrokeCount(words) {
	return new Promise((resolve) => {
		strokeCount(words).then((counts) => {
			Object.keys(counts).forEach((key) => {
				if ( !dict.getDifficultyRating(key) ) {
					dict.rateWord(key, counts[key]);
				}
			});
			resolve();
		});
	});
}
if ( process.argv[2] ) {
	fs.readFile(process.argv[2], 'utf-8', ( err, data ) => {
		const json = JSON.parse( data );
		let promises = [];
		dict.load().then(() => {
			json.forEach((word) => {
				if ( !dict.getWord( word ) && !word.match( /[\—\:\+\─\：\%\·\；\》\《\<\=\>\?\~\@\!\_\の\よ\う\な\だ\め\…\／\#\！\‧\　\’\‘\•]/ ) ) {
					promises.push( dict.saveWord( word, '?' ) );
				}
			})
			console.log( 'Added', promises.length, 'words');
			promises.push( rateWordsDifficultyByStrokeCount( json ) );
			Promise.all(promises).then(()=>dict.save());
		});
	} );

} else {
	dict.load().then(() => menu());
}
