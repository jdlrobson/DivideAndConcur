import { h } from 'preact';
import './tests/null-compiler.js';
import fs from 'fs';
import render from 'preact-render-to-string';
import StoryPanel from './src/js/ui/StoryPanel';

/** @jsx h */

const buf = fs.readFileSync('index.html.template', 'utf8');

const doSubstitution = (html) => {
    return buf.replace(/(<!-- STORY-PANEL-START -->)(.*?)(<!-- STORY-PANEL-END -->)/g,
        `$1${html}$3`);
};

const saveFile = (filename, text) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, doSubstitution(text), 'utf8', (error) => {
            if (error) {
                console.log(`Error occurred ${error}`);
                reject(error);
            } else {
                resolve();
            }
        });
    } );
};

const promises = [];

// index.html
promises.push(
    saveFile(
        'index.html',
        render(<StoryPanel />)
    )
);
