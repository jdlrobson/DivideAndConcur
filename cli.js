var util = require('util');
var dict = require('./data/dictionary');
const mcs = require('./src/mcs');
const htmlToText = require('html-to-text');
const chalk = require('chalk');
var fs = require('fs');
const strokeCount = require('./strokeCount' );

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

function addPinyinItem() {
	return new Promise( ( resolve ) => {
		var chinese, english;
		getUserInput( 'Enter Chinese:' ).then( ( chinese ) => {
			getUserInput( 'Enter Pinyin:' ).then( ( pinyin ) => {
				dict.savePinyin( chinese, pinyin )
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
			resolve( util.inspect(text).replace( /'([^\n]*)'/g, '$1' ).replace( '\\n', '' ) );
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

			getUserInput('What is component 1?').then((radical) => {
				components.push(radical);
				getUserInput('What is component 2?').then((radical) => {
					components.push(radical);
					dict.addDecomposition( answer, components );
					dict.save().then(()=>resolve());
				});
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
				const diff = dict.getDifficultyRating(char) || 0;
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

function menu() {
	const options = [
		'0: Lookup character',
		'1: Game',
		'2: Add pinyin',
		'3: Show pinyin',
		'4: Batch decompose',
		'5: Add to dictionary',
		'6: Decompose chinese word',
		'7: Translate',
		'8: Decrease difficulty of word(s)',
		'9: Increase difficulty of word(s)',
		'10: Expand a word',
		'11: Missing definitions',
		'12: Lookup word',
		'13: Delete word',
		'14: Auto-assign difficulty'
	];
	getUserInput( '**********************\n' + options.join('\n') + '\n**********************' )
		.then( ( val ) => {
			val = parseInt( val, 10 );
			switch ( val ) {
				case 0:
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
				case 2:
					addPinyinItem().then(() => menu());
					break;
				case 3:
					getUserInput('Enter chinese character').then((char) => {
						console.log(dict.getPinyin( char ));
					}).then(() => menu());
					break;
				case 4:
					getUserInput('Enter the common radical element').then((decomp) => {
						return getUserInput('Paste characters using this element').then((chars) => {
							Array.from(chars.replace(/ /g, '')).forEach((char) => {
								dict.addDecomposition( char, [ decomp, '?' ] );
							});
						} );
					}).then(() => menu());
					break;
				case 5:
					addDictionaryItem().then(() => menu());
					break;
				case 6:
					decomposeWord().then(() => menu());
					break;
				case 7:
					translate().then(() => menu());
					break;
				case 8:
					changeDifficulty(-1).then(()=>menu());
					break;
				case 12:
					getUserInput('Enter chinese character').then((msg) => {
						feedback( `rating=${dict.getDifficultyRating(msg)} and length=${dict.getWordLength(msg)}` )
						return menu()
					} );
					break;
				case 10:
					viewDecomposition().then(() => menu());
					break;
				case 11:
					const missing = dict.missing();
					console.log( `There are ${missing.length} words missing definitions without decompositions` );
					console.log( missing.sort(()=>Math.random() > 0.5 ? -1 : 1 ).join('   ' ) );
					menu();
					break;
				case 9:
					changeDifficulty(1).then(()=>menu());
					break;
				case 13:
					getUserInput('Enter chinese character to remove').then((word) => {
						dict.removeWord(word);
						return menu()
					} );
					break;
				case 14:
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
