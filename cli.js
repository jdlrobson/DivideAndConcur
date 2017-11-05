var util = require('util');
var dict = require('./data/dictionary');
const chalk = require('chalk');

function addDictionaryItem() {
	return new Promise( ( resolve ) => {
		var chinese, english;
		getUserInput( 'Enter Chinese:' ).then( ( chinese ) => {
			getUserInput( 'Enter English:' ).then( ( english ) => {
				dict.saveWord( chinese, english ).then(() => {
					resolve();
				});
			} );
		} );
	} );
}

function rateWord() {
	return getUserInput('What is the Chinese word you want to rate?').then((word) => {
		return getUserInput('How difficult is that? (1+)').then((rating) => {
			return dict.rateWord(word, parseInt(rating, 10));
		});
	});
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
		menu();
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

function translate() {
	return getUserInput('What is the Chinese word you want to translate?').then((answer) => {
		feedback( dict.translate(answer) );
	});
}

function menu() {
	const options = [
		'1: Deal radicals',
		'2: Deal singles',
		'3: Deal double cards',
		'4: Deal triple cards',
		'5: Add to dictionary',
		'6: Decompose chinese word',
		'7: Translate',
		'8: Report difficulty of word',
		'9: Lookup word difficulty',
	];
	getUserInput( '**********************\n' + options.join('\n') + '\n**********************' )
		.then( ( val ) => {
			val = parseInt( val, 10 );
			switch ( val ) {
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
					rateWord().then(() => menu());
					break;
				case 9:
					getUserInput('Enter chinese character').then((msg) => {
						feedback( dict.getDifficultyRating(msg) )
						return menu()
					} );
					break;
				default:
					feedback('Huh?');
					menu();
			}
		});
}
dict.load().then(() => menu());

