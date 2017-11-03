/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'

function getWords(size) {
  return fetch('/data/' + size).then((r) => {
    return r.json();
  });
}

export default class Game extends Component {
  construct() {
    this.state = {};
  }
  componentDidMount() {
    const setState = this.setState.bind( this );
    getWords(0).then((dictionary) => {
      setState( { dictionary } );
    });
  }
  render() {
    const props = this.props;
    const dictionary = this.state && this.state.dictionary;
    const cards = dictionary ? Object.keys( dictionary ).map((char) => {
      return <Card
        className='card'
        key={'card-' + char}
        character={char}
        english={dictionary[char]}
      />;
    }) : false;
    const loader = <div>Loading up!</div>;

    return (
      <div className="game">
      <h2>Level {props.level}</h2>
      {cards || loader }
      </div>
    );
  }
}
