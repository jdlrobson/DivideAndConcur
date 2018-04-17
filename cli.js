var util = require('util');
var dict = require('./data/dictionary');
const htmlToText = require('html-to-text');
const chalk = require('chalk');
var fs = require('fs');
const strokeCount = require('./strokeCount' );
var hanzi = require("hanzi");
var hanziLoaded = false;
const blurb = require('./data/blurb.js');
const pinyin = require( 'chinese-to-pinyin' );

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

			getUserInput('What are the components?').then((radicals) => {
				const components = Array.from(radicals.trim().replace(/ /g, ''));
				if ( components.length ) {
					dict.addDecomposition( answer, components );
					dict.save().then(()=>resolve());
				} else {
					console.log('Decomposition cannot be empty');
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

function loadHanzi() {
	if ( !hanziLoaded ) {
		hanzi.start();
		hanziLoaded = true;
	}
}

function removeUnreadableCharacters(components) {
	return components.filter((char) => char.match(/[㇕𥃭㇕𠮛]/) === null);
}

function batchAutoDecompose(words) {
	loadHanzi();
	words.filter((char) => char.length === 1).forEach((char) => {
		const decomps = hanzi.decompose(char);
		let components = decomps.components1.filter((comp) =>
			comp !== 'No glyph available' );

		if ( ( components.length === 1 && components[0] !== char ) || components.length > 1 ) {
			const existingDecomps = dict.getDecompositions()[char] || [];
			components = removeUnreadableCharacters(components).slice(0, 2);
			if ( existingDecomps.length !== components.length ||
				removeUnreadableCharacters(existingDecomps).length !== existingDecomps.length
			) {
				console.log('Add', char, components );
				dict.addDecomposition( char, components );
			}
		}
	})
}

function getEnglish(char) {
	loadHanzi();
	var inEnglish = hanzi.definitionLookup(char, 's');
	return !inEnglish ? ['?'] : inEnglish.map((definition) => {
		return definition.definition;
	}).join('/').split('/')
		.filter((def)=> {
			const l = def.toLowerCase();
			return l.indexOf('surname ') === -1 && l.indexOf('[') === -1 && l.length < 15;
		});
}

function clean() {
	loadHanzi();
	const decomps = dict.getDecompositions();
	Object.keys( decomps ).map((key) => {
		const decomp = decomps[key];
		if ( decomp.indexOf( '?' ) > -1 ) {
			console.log(`Warning: ${key} has ? decomposition.`, decomp);
		}
		decomp.forEach((char) => {
			Array.from(char).forEach((chinese)=> {
				const p = dict.getPinyin(chinese);
				if ( !p ) {
					const _pinyin = pinyin(chinese);
					if ( _pinyin ) {
						dict.savePinyin(chinese, _pinyin);
						console.log('Add pinyin', chinese, '=', _pinyin);
					}
				}
			});
		});
	});
	dict.all().forEach((char) => {
		const decomp = dict.decompose(char);
		if ( decomp.indexOf( '?' ) > -1 ) {
			// reduce the hanzi decomposition to real characters
			const hanz = hanzi.decompose(char).components1.filter((c) => {
					return c !== 'No glyph available'
				});
			if ( hanz.length === 2 ) {
				console.log('Add decomposition', char, decomp, hanz);
				dict.addDecomposition(char, hanz);
			} else {
				const hanzUnique = hanz.filter((char) => decomp.indexOf(char) === -1);
				if ( hanzUnique.length ) {
					const newDecomp = decomp.map((char, i) => char === '?' ? hanzUnique[0] : char);
					console.log('Decom issue', char, decomp, hanzUnique, newDecomp);
					dict.addDecomposition(char, newDecomp);
				} else {
					dict.addDecomposition(char, decomp.filter((char) => char !== '?'));
					console.log('Removed ? from decomp', char);
				}
			}
		}
	})
	dict.all().forEach((chinese) => {
		const eng = dict.getWord(chinese);
		if ( eng === '?' ) {
			console.log('Remove from dictionary:', chinese);
			dict.removeWord(chinese);
		} else if ( eng.match(/\//) ) {
			const newEng = eng.replace(/\//g, '; ');
			console.log('Switched / for ; in ' + newEng);
			dict.saveWord(chinese, newEng);
		}
		// update pinyin for one characters
		Array.from(chinese).forEach((char) => {
			const p = dict.getPinyin(char);
			if ( !p ) {
				const _pinyin = pinyin(char);
				dict.savePinyin(char, _pinyin);
				console.log('Add pinyin', char, '=', _pinyin);
			}
		});
	})
	dict.missing().forEach((chinese)=> {
		var english = getEnglish(chinese).slice(0, 3).join('; ');
		if ( english && english !== '?' ) {
			dict.saveWord( chinese, english );
			console.log('added', chinese, english);
		}
	});
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
		'13: Clean',
		'14: Add blurb',
		'15: View cards with difficulty range'
	];
	getUserInput( '**********************\n' + options.join('\n') + '\n**********************' )
		.then( ( val ) => {
			val = parseInt( val, 10 );
			switch ( val ) {
				case 4:
					getUserInput('Enter chinese character').then((msg) => {
						console.log(getEnglish(msg));
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
						var words = dict.all().filter((char) => {
							return dict.getWordLength(char) === 1 && dict.decompose(char).length === 1;
						});
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
						const usedBy = dict.usedBy(char);
						const translation = usedBy.
							map((char)=>`${char} (${dict.getWord(char)})`).join('; ')
						feedback( `Character: ${char}` );
						feedback( `English: ${dict.getWord( char )}`)
						feedback( `Pinyin: ${dict.getPinyin( char )}`);
						feedback( `${dict.decompose( char ).join('+')}` );
						feedback( dict.translate(char) );
						feedback( `Standalone Difficulty=${dict.getDifficultyRating(char, true)}` );
						feedback( `True difficulty=${dict.getDifficultyRating(char)}` );
						feedback( `Length=${dict.getWordLength(char)}` );
						feedback( `Used by=${usedBy.length ? translation : 'Nothing'}`)
						feedback( `Blurb=\n${blurb.getBlurb(char)}`)
					} ).then(() => menu());
					break;
					break;
				case 10:
					const missing = dict.missing();
					console.log( `There are ${missing.length} words missing definitions without decompositions` );
					console.log( missing.sort(()=>Math.random() > 0.5 ? -1 : 1 ).join('   ' ) );
					menu().then(()=> {
						dict.reload();
						return dict.save();
					} );
					break;
				case 9:
					changeDifficulty(1).then(()=>menu());
					break;
				case 11:
					getUserInput('Enter chinese character to remove').then((word) => {
						const deleted = dict.removeWord(word);
						if ( deleted ) {
							console.log('Removed word (retained difficulty and decompositions)', word);
						} else {
							console.log('Word does not exist');
						}
						return menu()
					} );
					break;
				case 12:
					getUserInput('Enter chinese character to count strokes for').then((word) => {
						return rateWordsDifficultyByStrokeCount([word]).then(()=> menu());
					} );
					break
				case 14:
					getUserInput('Enter chinese character to add blurb for').then((word) => {
						getUserInput('Enter blurb').then((text) => {
							blurb.addBlurb(word, text);
							fs.writeFileSync(blurb.JSON_FILE, blurb.getBlurbJSONString());
							return menu();
						} );
					} );
					break;
				case 15:
					getUserInput('Word length?').then((wl) => {
						const wordL = parseInt(wl, 10);
						getUserInput('What is the range? e.g. 0,10').then((rangeStr) => {
							let range = rangeStr.split(',').map((str) => str ? parseInt(str, 10) : 0);
							if ( range.length === 1) {
								range.push(range[0]);
							}
							console.log(`Looking in range ${range[0]} - ${range[1]}`);
							dict.all().filter((word) => {
								const rating = dict.getDifficultyRating(word);
								//console.log('giot', rating, rating > range[0], rating <= range[1]);
								return rating >= range[0] && rating <= range[1];
							}).filter(
								(a)=>dict.getWordLength(a) === wordL
							).sort(
								(a,b)=>dict.getWordLength(a)<dict.getWordLength(b) ? -1 : 1
							).forEach((word) => {
								console.log(word, dict.getWord(word), 'word length=', dict.getWordLength(word));
							});
							return menu();
						} );
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
				dict.rateWord(key, counts[key]);
			});
			resolve();
		});
	});
}

function importWords(json) {
	let promises = [];
	json.forEach((word) => {
		if ( !dict.getWord( word ) &&
			// blacklist of characters to ignore.
			!word.match( /[\—\:\+\─\：\%\·\；\》\《\<\=\>\?\~\@\!\_\の\よ\う\な\だ\め\…\／\#\！\‧\　\’\‘\•]/ )
		) {
			let def = getEnglish(word).join(';');
			def = def.trim();
			if ( def && def !== '?' ) {
				console.log(`Imported ${word}=${def}`, def === '?');
				promises.push( dict.saveWord( word, def ) );
			}
		}
	})
	console.log( 'Imported', promises.length, 'words');
	promises.push( rateWordsDifficultyByStrokeCount( json ) );
	return Promise.all(promises).then(()=>dict.save());
}

if ( process.argv[2] ) {
	const filename = process.argv[2];
	fs.readFile(filename, 'utf-8', ( err, data ) => {
		const json = JSON.parse( data );
		dict.load().then(() => {
			return importWords(json);
		});
	} );

} else {
	dict.load().then(() => menu());
}
