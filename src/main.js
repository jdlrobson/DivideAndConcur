import { h, render, Component } from 'preact';
import Game from './Game'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

(function () {
  let memory = localStorage.getItem('memory');
  memory = memory ? JSON.parse( memory ) : false;

  function saveMemory(newMemory) {
    localStorage.setItem('memory', JSON.stringify(newMemory));
  }

  render(
    <Game initialMemory={memory} saveMemory={saveMemory} />,
    document.getElementById('container')
  );
}());

