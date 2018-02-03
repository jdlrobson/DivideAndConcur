var pinyin = require( 'chinese-to-pinyin' );

function DictionaryUtils( words, decompositions, difficulties ) {
  this.words = words;
  this.decompositions = decompositions;
  this.difficulties = difficulties;
  this.pinyin = {};
  this.levelCache = {};
}
DictionaryUtils.prototype = {
  all: function () {
    return Object.keys(this.words);
  },
  getDecompositions: function () {
    return this.decompositions;
  },
  missing: function () {
    return this.all()
      .filter((word) => ( ( !this.words[word] || this.words[word] === '?' ) || !this.words[word] ));
  },
  getPinyin: function ( word ) {
    if ( this.pinyin[word] ) {
      return this.pinyin[word];
    } else {
      const _pinyin = pinyin(word);
      this.pinyin[word] = _pinyin;
      return _pinyin;
    }
  },
  getWord: function ( word ) {
    return this.words[word];
  },
  translate: function ( word ) {
    var words = this.words;
    var getWord = this.getWord.bind( this );
    var translate = this.translate.bind( this );
    var decompositions = this.decompositions;
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
          if ( radical && decompositions[radical] ) {
            c.push( translate( radical ) );
          } else {
            c.push( words[radical] );
          }
        } else {
          if ( radical && decompositions[radical] ) {
            c.push( translate(radical)  );
          } else {
            c.push( '?' );
          }
        }
      });
      composition = ' (' + c.join(' · ') + ')';
    }
    return translation + composition;
  },
  /**
   * Difficulty is the difficulty of the word + the combined difficulties of the radicals
   * @param {String} word
   * @param {Boolean} forWordAlone whether we should consult the difficulties of the composing radicals
   * @return {Number}
   */
   getDifficultyRating: function (word, forWordAlone) {
    var thisWord = ( this.difficulties[word] || 0 );
    var combinedDifficulties = this.decompose(word)
      .reduce((acc, component) => acc + this.difficulties[component] || 0, 0 );
    return forWordAlone ? thisWord : Math.max( thisWord, combinedDifficulties );
  },
  getWordLength: function ( word ) {
    var strLen = word.length;
    if ( strLen === 1 ) {
      // returning 1 nearly all the time
      return !this.decompositions[word] ? 0 : this.decompose(word, true).length;
    } else {
      return Array.from(word).
        filter((char) => char !== word ).
        reduce((acc, char) => this.getWordLength(char) + acc + strLen, 0 );
    }
  },
  /**
   * @param {Number} wordLength (character length) to restrict words to. If word length is zero
   * it will be assumed you want to obtain radicals.
   * Only words which do not have decompositions will be shown.
   * If wordLength is 1 single characters which have not been decomposed will be shown
   * For all other word counts we assume that each character can be decomposed.
   * @param {Number} [difficultyLevel] if defined results will be limited to this difficulty level
   * @param {Number} [max] if defined results will be limited to this amount of results.
   */
  getWords: function (wordLength, difficultyLevel, max) {
    var cacheKey = `${wordLength}.${difficultyLevel}`;
    if ( !this.levelCache[cacheKey] ) {
      this.levelCache[cacheKey] = this.getWordsWithoutCache( wordLength, difficultyLevel );
    }
    return this.levelCache[cacheKey].slice( 0, max );
  },
  getWordsWithoutCache: function (wordLength, difficultyLevel) {
    var words = this.words;
    var getWordLength = this.getWordLength.bind( this );
    var decompositions = this.decompositions;
    var getDifficultyRating = this.getDifficultyRating.bind( this );

    function matchesDifficultyLevel(w) {
      return difficultyLevel === undefined || getDifficultyRating(w) === difficultyLevel
    }
    return Object.keys( words ).filter((w) => {
        return getWordLength(w) === wordLength && matchesDifficultyLevel(w);
      } );
  },
  decompose: function( word, isRecursive ) {
    var decompose = this.decompose.bind( this );
    var words = this.words;
    var decompositions = this.decompositions;
    var parts = [];
    Array.from(word).forEach((radical) => {
      var decomp = decompositions[radical];
      // if a word was accidentally decomposed as itself
      if ( !decomp ) {
        // no decompositions possible, have reached smallest unit
        parts.push(radical);
      } else if ( isRecursive ) {
        // this radical itself is composed of different parts
        Array.from( decomp ).forEach((decomposedRadical) => {
          if ( decomposedRadical !== word ) {
            var _decomposition = decompose( decomposedRadical );
            parts = parts.concat( decompose( decomposedRadical ) );
          } else {
            console.log('warning ' + word + ' decomposes to nothing or itself')
          }
        });
      } else {
        parts = Array.from( decomp );
      }
    });
    return parts;
  }
}

module.exports = DictionaryUtils;