import { h, render, Component } from 'preact';
import Game from './Game'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

function getWords(size) {
  return fetch('/data/' + size).then((r) => {
    return r.json();
  });
}

(function () {
  getWords(0).then((dictionary) => {
    render(
      <Game level={1} dictionary={dictionary} />,
      document.getElementById('container')
    );
  });
}());

