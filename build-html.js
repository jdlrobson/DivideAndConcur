import { h } from 'preact';
import './tests/null-compiler.js';
import fs from 'fs';
import render from 'preact-render-to-string';
import ProgressBar from './src/ui/ProgressBar';

const FILENAME = 'index';

/** @jsx h */

const buf = fs.readFileSync(FILENAME + '.html.template', 'utf8');

const doSubstitution = ( input ) => {
    let html = render(
      <ProgressBar known={0} total={100} />
    );
    return input.replace(/(<!-- PROGRESSBAR-START -->)(.*?)(<!-- PROGRESSBAR-END -->)/g, '$1' + html + '$3' )
}
fs.writeFile(FILENAME + '.html', doSubstitution(buf), 'utf8', (error) => {
    console.log( error ? 'Error occurred' + error : 'Wrote html without error' );
});
