function DictionaryUtils( words, decompositions, difficulties, pinyin ) {
  this.words = words;
  this.decompositions = decompositions;
  this.difficulties = difficulties;
  this.pinyin = pinyin;
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
      .filter((word) => ( ( !this.words[word] || this.words[word] === '?' ) || !this.words[word] ) &&
         !this.decompositions[word] && !this.getPinyin(word));
  },
  getPinyin: function ( word ) {
    return this.pinyin[word];
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
   getDifficultyRating: function (word) {
    return this.difficulties[word] || 0;
  },
  getWordLength: function ( word ) {
    var strLen = word.length;
    if ( strLen === 1 ) {
      // returning 1 nearly all the time
      return !this.decompositions[word] ? 0 : this.decompose(word).length;
    } else {
      return Array.from(word).reduce((acc, char) => this.getWordLength(char) + acc + strLen);
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
    var words = this.words;
    var getWordLength = this.getWordLength.bind( this );
    var decompositions = this.decompositions;
    var getDifficultyRating = this.getDifficultyRating.bind( this );

    function matchesDifficultyLevel(w) {
      return difficultyLevel === undefined || getDifficultyRating(w) === difficultyLevel
    }
    var keys = Object.keys( words ).filter((w) => {
        return getWordLength(w) === wordLength && matchesDifficultyLevel(w);
      } );
    return keys.slice( 0, max );
  },
  decompose: function( word ) {
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
      } else {
        // this radical itself is composed of different parts
        Array.from( decomp ).forEach((decomposedRadical) => {
          if ( decomposedRadical !== word ) {
            var _decomposition = decompose( decomposedRadical );
            parts = parts.concat( decompose( decomposedRadical ) );
          } else {
            console.log('warning ' + word + ' decomposes to nothing or itself')
          }
        });
      }
    });
    return parts;
  }
}

module.exports = DictionaryUtils;