function DictionaryUtils( words, decompositions, difficulties ) {
  this.words = words;
  this.decompositions = decompositions;
  this.difficulties = difficulties;
}
DictionaryUtils.prototype = {
  getDecompositions: function () {
    return this.decompositions;
  },
  missing: function () {
    return Object.keys( this.words )
      .filter((word) => (this.words[word] === '?' || !this.words[word] ) && !this.decompositions[word]);
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
            c.push( translate(radical) );
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
    var decompose = this.decompose.bind( this );
    var decompositions = this.decompositions;
    var getDifficultyRating = this.getDifficultyRating.bind( this );

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