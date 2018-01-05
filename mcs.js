require('isomorphic-fetch');

function lookup(character, lines) {
  return fetch('https://en.wiktionary.org/api/rest_v1/page/mobile-sections/' + encodeURIComponent(character))
      .then((res) => res.json())
      .then((json) => {
        let text = '';
        let isChinese = false;
        let chineseLevel;
        if ( json && json.remaining && json.remaining.sections ) {
          json.remaining.sections.forEach((section) => {
            if ( isChinese && section.toclevel === chineseLevel ) {
              isChinese = false;
            }
            if ( section.line === 'Chinese' ) {
              isChinese = true;
              chineseLevel = section.toclevel;
            }
            if ( isChinese ) {
              if ( lines.indexOf(section.line) > -1 ) {
                text += section.text;
              }
            }
          });
        }
        return text;
      } );
}

module.exports = {
  getDefinition: function ( character ) {
    return lookup( character, [ 'Definitions', 'Definition' ] )
  },
  getPronounciation: function ( character ) {
    return lookup( character, [ 'Pronunciation' ] )
  }
};