const fs = require('fs');
const { exec } = require('child_process');

function strokeCount(words) {
  return new Promise((resolve) => {
    // load words into strokecounter/datatocount.txt
    fs.writeFile('./strokecounter/datatocount.txt', words.join('\n') + '\n', (err) => {
      // done. run perl script

      exec('cd strokecounter && perl strokecounter_batchmode.pl', (err, stdout, stderr) => {
          // load words from strokecounter/strokecounts.txt
        fs.readFile( './strokecounter/strokecounts.txt', 'utf-8', function ( err, data ) {
          let response = {};

          const lines = data.split('\n');
          words.forEach((word, i) => {
            response[word] = parseInt( lines[i].trim(), 10 );
          });

          // return result
          resolve( response );
        } );
      });
    } );
  });
}

module.exports = strokeCount;
