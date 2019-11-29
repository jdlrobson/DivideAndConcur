import { h } from 'preact';
import './tests/null-compiler.js';
import fs from 'fs';
import render from 'preact-render-to-string';
import Chrome from './src/js/ui/Chrome';
import StoryPanel from './src/js/ui/StoryPanel';

/** @jsx h */

const buf = fs.readFileSync('index.html.template', 'utf8');

const headTags = `
<link rel="stylesheet" href="index.less">
<link rel="manifest" href="manifest.webmanifest" />
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-75478054-3"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-75478054-3');
</script>
`;
const bodyTags = `
<script type="text/javascript" src="src/js/shims.js"></script>
<script type="text/javascript" src="src/js/main.js"></script>
<script type="text/javascript">
    if ('serviceWorker' in navigator && window.location.host.indexOf('localhost:') === -1) {
        navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
        .then(function(reg) {
          // registration worked
          console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch(function(error) {
          // registration failed
          console.log('Registration failed with ' + error);
        });
    }
</script>`;

const doSubstitution = (html) => {
    return buf.replace('<!-- HEAD -->', headTags)
        .replace('<!-- BODY -->', html  + bodyTags);
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
        render(
            <Chrome logo="./src/logo.png">
                <StoryPanel />
            </Chrome>
        )
    )
);
