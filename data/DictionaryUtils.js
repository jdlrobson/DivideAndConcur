function DictionaryUtils( words, decompositions, difficulties, pinyin = {} ) {
  this.words = words;
  this.decompositions = decompositions;
  this.difficulties = difficulties;
  this.pinyin = pinyin;
  // Provide definitions for pinyin not covered inside chinese-to-pinyin
  this.pinyin['𥫗'] = 'shì';
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
    return this.pinyin[word] || Array.from(word).map((w) => this.pinyin[w] || '').join( ' ' );
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

    if ( Array.from(word).length > 1 ) {
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
    const combinedDifficulties = this.decompose(word)
      .reduce((acc, component) => {
        return acc + ( this.difficulties[component] || 0 );
      }, 0 );
    return forWordAlone ? thisWord : Math.max( thisWord, combinedDifficulties );
  },
  getWordLength: function ( word ) {
    const uniques = (char, i, self) => self.indexOf(char) === i;
    const decompose = this.decompose.bind(this);
    const getWord = this.getWord.bind(this);
    const chars = Array.from(word);
    const uniqueChars = chars.filter(uniques);
    let penalty = 0;
    uniqueChars.forEach((char) => {
      if ( !getWord( char ) ) {
        penalty += 1;
      }
    });
    const len = uniqueChars.
        map(
          (word) => decompose(word, true).
            filter((char) => char !== word )
        ).
        reduce((acc, decompositions) => {
          let penalty = 0;
          decompositions.forEach((char) => {
            if ( !getWord( char ) ) {
              penalty += 1;
            }
          });
          return decompositions.length + acc + penalty;
        }, 0 );
    if ( chars.length > 1 && len === 0 ) {
      return 1;
    } else {
      return chars.length === 2 ? len + 1 + penalty : len;
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
  /**
   * @param {string} char
   * @return {array} of words with length greater than 1 character
   *   that contain this character. Compound words are preferred, however if there
   * are no compound words, single characters will be shown
   */
  usedBy: function ( char ) {
    const d = this.decompositions;
    const w = this.words;
    const l = this.getWordLength( char );
    function usedByRadical( radical ) {
      return Object.keys(d).filter((key) => {
        return d[key].indexOf( radical ) > -1 && w[key];
      });
    }

    const compoundWords = Object.keys( d ).filter(
      key => d[key].indexOf(char) > -1
    ).concat(
      Object.keys(w).filter((key)=> key.indexOf(char) > -1 && key !== char)
    );
    const fCompoundWords = compoundWords.filter((c) => c !== char && Array.from(c).length > 1 );
    const usedBy = l === 0 ? usedByRadical( char ).concat( fCompoundWords ) : fCompoundWords; 
    return usedBy.length > 0 ? usedBy : compoundWords; 
  },
  decompose: function( word, isRecursive ) {
    if ( Array.from(word).length > 1 && !isRecursive ) {
      return word.split('');
    }
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
            var _decomposition = decompose( decomposedRadical, true );
            parts = parts.concat( _decomposition );
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