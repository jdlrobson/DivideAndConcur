import { h, render, Component } from 'preact';
import Game from './Game'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

(function () {
  render(
    <Game level={1} />,
    document.getElementById('container')
  );
}());

