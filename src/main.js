import { h, render, Component } from 'preact';
import Game from './Game'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

function getWords() {
  return fetch('/data').then((r) => {
    return r.json();
  });
}

(function () {
  getWords().then((dictionary) => {
    // Jumble up the words
    let words = Object.keys(dictionary).
      filter((word)=>{
        return word.length === 1;
      } ).
      sort(()=>Math.random() < 0.5 ? -1 : 1);

    let filteredDictionary = {};
    words.forEach((word) => {
      filteredDictionary[word] = dictionary[word];
    })
    render(
      <Game level={1} dictionary={filteredDictionary} />,
      document.getElementById('container')
    );
  });
}());

